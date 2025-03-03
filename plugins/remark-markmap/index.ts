import type { RemarkPlugin } from '@astrojs/markdown-remark'
import { visit } from 'unist-util-visit'
import { persistCSS, persistJS } from 'markmap-common'
import { Transformer, type IMarkmapJSONOptions } from 'markmap-lib';
import markmapInit from './markmap-init';
import matter from 'gray-matter';

const transformer = new Transformer();

const remarkMarkmap: RemarkPlugin = () => (tree, _) => {
  
  let markmapCount = 0
  const assetsHtmlsSet = new Set<string>()

  visit(tree, ['code'], (node, index, parent) => {
    if (!(node.type === 'code' && node.lang === 'markmap' )) return
    
    // Get params
    const { data: frontmatter, content } = matter(node.value);
    const { id, style, jsonOptions } = Object.assign({...frontmatter},{
      id: frontmatter['id'] ?? Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36),
      jsonOptions: frontmatter['options'] as IMarkmapJSONOptions
    })
    
    // Render
    const { root, features } = transformer.transform(content);
    const { styles=[], scripts=[] } = transformer.getUsedAssets(features)
    
    const wrapHtml = `
      <div class="markmap-wrap" id="${id}">
        <script type="application/json">${JSON.stringify(root)}</script>
        <script type="application/json">${JSON.stringify(jsonOptions)}</script>
      </div>
    `
    const assetsHtmls = [
      ...persistCSS([
        { type: 'style', data: `#${id}{height:500px;width:100%}` },
        { type: 'style', data: template(style,{id}) },
        ...styles
      ]),
      ...persistJS(scripts, {
        getMarkmap: () => window.markmap,
        root,
      })
    ]

    // Replace node
    parent!.children.splice(index!, 1, { type: 'html', value: wrapHtml.trim() })
    // Save assetsHtmls
    assetsHtmls.forEach(html => assetsHtmlsSet.add(html))
    // Count Increment
    markmapCount++
  })

  markmapCount && tree.children.push({
    type: 'html',
    value: [
      `<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>`,
      `<script src="https://cdn.jsdelivr.net/npm/markmap-view"></script>`,
      `<script src="https://cdn.jsdelivr.net/npm/markmap-toolbar"></script>`,
      ...assetsHtmlsSet,
      `<style>.markmap-wrap{position:relative;}.markmap-wrap>svg{width:100%;height:100%;}</style>`,
      `<script>(${markmapInit.toString()})();</script>`,
    ].join('')
  })
}

function template(template: string, props?: {}) {
  return !props
   ? template
   : new Function(...Object.keys(props), `return \`${template}\`;`)(...Object.values(props))
}

export default remarkMarkmap
