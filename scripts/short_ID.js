const yaml = ProxyUtils.yaml;

let config;
try {
  config = yaml.safeLoad($content ?? $files[0]);
} catch (e) {
  console.error('YAML parse error:', e.message);
  $content = $content ?? $files[0];
  return { $content, $files, $options };
}

// 确保 short-id 是字符串（防止被解析为数字）
if (config.proxies && Array.isArray(config.proxies)) {
  for (const proxy of config.proxies) {
    if (proxy['reality-opts'] && typeof proxy['reality-opts']['short-id'] !== 'string') {
      // 转为字符串，但不加引号！
      const sid = proxy['reality-opts']['short-id'];
      if (sid != null) {
        proxy['reality-opts']['short-id'] = String(sid);
      }
    }
  }
}

// 先 dump 成 YAML 字符串
let yamlStr = yaml.dump(config);

// 手动对 short-id 行添加双引号（正则替换）
// 匹配：short-id: 后跟非引号开头的值（如 02248546, 776754a6）
yamlStr = yamlStr.replace(
  /^(\s*short-id:\s*)([^\s"'#][^\n#]*?)\s*$/gm,
  (match, prefix, value) => {
    // 如果 value 已被引号包裹，跳过
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return match;
    }
    // 否则用双引号包裹
    return `${prefix}"${value}"`;
  }
);

$content = yamlStr;
return { $content, $files, $options };
