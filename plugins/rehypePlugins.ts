import type { RehypePlugin } from '.'
import { visit } from 'unist-util-visit'
import template from './template'

const rehypeImageLazyLoad: RehypePlugin = () => {
  return (tree) => {
    let haveScript = false
    visit(tree, (node) => {
      if (node.type == 'element' && node.tagName == 'img') {
        node.properties['class'] = (
          (node.properties['class'] || '') + ' lazyload'
        ).trim()
        node.properties['data-src'] = node.properties['src']
        node.properties['src'] = ''
        if (haveScript) return
        haveScript = true
        tree.children.push({
          type: 'element',
          tagName: 'script',
          properties: { type: 'text/javascript' },
          children: [{ type: 'text', value: template('image-lazy-load.js') }],
        })
      }
    })
  }
}

export default [rehypeImageLazyLoad]
