// 极简 DOM 工具：用模板字符串渲染视图，再在结果树上挂事件。
// 全部内容来自我们自己的静态数据，无用户输入注入风险。

export const app = document.getElementById('app') as HTMLElement

/** 渲染 HTML 到 #app 并返回根元素（便于挂事件监听） */
export function mount(html: string): HTMLElement {
  app.innerHTML = html
  return app
}

/** 绑定点击：把同一类按钮的点击统一代理到 handler */
export function on<T extends HTMLElement>(
  root: ParentNode,
  selector: string,
  handler: (target: T) => void,
): void {
  root.querySelectorAll<T>(selector).forEach((node) => {
    node.addEventListener('click', (e) => {
      e.stopPropagation()
      handler(node)
    })
  })
}