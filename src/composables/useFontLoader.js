const loaded = new Set()

export function useFontLoader() {
  async function loadFont(url) {
    if (!url || loaded.has(url)) return
    loaded.add(url)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
    await document.fonts.ready
  }

  return { loadFont, loaded }
}
