let ubbOutput;

// 动态样式解析函数
function parseStyleToUbb(style) {
  let ubbStart = "";
  let ubbEnd = "";

  // 正则表达式匹配样式规则
  const colorRegex = /color:\s*([^;]+);?/;
  const bgColorRegex = /background-color:\s*([^;]+);?/;
  const boldRegex = /font-weight:\s*(bold|700);?/;
  const italicRegex = /font-style:\s*italic;?/;
  const underlineRegex = /text-decoration:\s*underline;?/;

  // 匹配颜色
  const colorMatch = style.match(colorRegex);
  if (colorMatch) {
    ubbStart += `[color=${colorMatch[1]}]`;
    ubbEnd = `[/color]` + ubbEnd;
  }

  // 匹配背景颜色
  const bgColorMatch = style.match(bgColorRegex);
  if (bgColorMatch) {
    ubbStart += `[backcolor=${bgColorMatch[1]}]`;
    ubbEnd = `[/backcolor]` + ubbEnd;
  }

  // 匹配加粗
  if (boldRegex.test(style)) {
    ubbStart += `[b]`;
    ubbEnd = `[/b]` + ubbEnd;
  }

  // 匹配斜体
  if (italicRegex.test(style)) {
    ubbStart += `[i]`;
    ubbEnd = `[/i]` + ubbEnd;
  }

  // 匹配下划线
  if (underlineRegex.test(style)) {
    ubbStart += `[u]`;
    ubbEnd = `[/u]` + ubbEnd;
  }

  return { ubbStart, ubbEnd };
}

// HTML to UBB 转换函数
function htmlToUbb(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  let ubbResult = "";

  // 递归解析HTML节点
  function parseNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      let { ubbStart, ubbEnd } = { ubbStart: "", ubbEnd: "" };

      // 如果是 class="line"，检查是否为空内容
      if (node.classList && node.classList.contains("line")) {
        const hasContent = Array.from(node.childNodes).some(child => {
          return (
            child.nodeType === Node.ELEMENT_NODE ||
            (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== "")
          );
        });

        node.childNodes.forEach(parseNode); // 递归解析内容

        // 如果包含有效内容，添加换行符
        if (hasContent) {
          ubbResult += "\n";
        }
        return; // 继续处理其他逻辑
      }

      // 解析样式
      const style = node.getAttribute("style");
      if (style) {
        ({ ubbStart, ubbEnd } = parseStyleToUbb(style));
      }

      // 添加起始UBB标签
      ubbResult += ubbStart;

      // 递归解析子节点
      node.childNodes.forEach(parseNode);

      // 添加结束UBB标签
      ubbResult += ubbEnd;

    } else if (node.nodeType === Node.TEXT_NODE) {
      ubbResult += node.textContent; // 添加文本内容
    }
  }

  // 从根节点解析
  doc.childNodes.forEach(parseNode);
  return ubbResult;
}

// 文件读取函数
function handleFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("input").value = reader.result;
  };
  reader.readAsText(file);
}

// 文件拖拽上传
const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragover");
  if (event.dataTransfer.files.length) {
    handleFile(event.dataTransfer.files[0]);
  }
});
// 点击上传
dropZone.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".html,.txt";
  input.style.display = "none";

  // 文件变更事件
  input.addEventListener("change", (event) => {
    if (event.target.files.length) {
      handleFile(event.target.files[0]);
    }
  });
  input.click();
});

// 转换事件
document.getElementById("convertBtn").addEventListener("click", () => {
  const htmlInput = document.getElementById("input").value;

  // 调用转换函数
  ubbOutput = htmlToUbb(htmlInput);
  document.getElementById("output").value = ubbOutput;
});

// 保存输出到文件
document.getElementById("saveBtn").addEventListener("click", () => {
  const output = ubbOutput;
  if (!output.trim()) {
    alert("请先转换再下载！");
    return;
  }
  const blob = new Blob([output], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "html2ubb.txt";
  link.click();
});

// 复制到剪贴板
document.getElementById("copyBtn").addEventListener("click", () => {
  const output = ubbOutput;
  navigator.clipboard.writeText(output).then(() => {
    alert("已复制到剪贴板！");
  });
});