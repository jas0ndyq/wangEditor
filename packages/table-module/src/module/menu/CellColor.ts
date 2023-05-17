/**
 * @description table header menu
 * @author wangfupeng
 */

import { Transforms, Range, Editor } from 'slate'
import { IDropPanelMenu, IDomEditor, DomEditor, t } from '@wangeditor/core'
import { CELL_COLOR_SVG } from '../../constants/svg'
import $, { Dom7Array, DOMElement } from '../../utils/dom';

import { TableCellElement, TableElement } from '../custom-types'
import { getFirstRowCells, isTableWithChooser } from '../helpers'
import { mergeAll, regTableMouseMoveEvent } from '@wangeditor/table-module/src/utils/table'

// class CellColor implements IButtonMenu {
//   readonly title = t('tableModule.cellColor')
//   readonly iconSvg = CELL_COLOR_SVG
//   readonly tag = 'button'

//   // 是否已设置表头
//   getValue(editor: IDomEditor): string | boolean {
//     const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement
//     if (tableNode == null) return false

//     return isTableWithChooser(tableNode)
//   }

//   isActive(editor: IDomEditor): boolean {
//     return false
//   }

//   isDisabled(editor: IDomEditor): boolean {
//     const { selection } = editor
//     if (selection == null) return true
//     if (!Range.isCollapsed(selection)) return true
//     return false
//   }

//   exec(editor: IDomEditor) {
//     if (this.isDisabled(editor)) return
//     const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement
//   }
// }

/**
 * @description color base menu
 * @author wangfupeng
 */




class CellColor implements IDropPanelMenu {
  readonly title = "单元格背景色"
  readonly iconSvg = CELL_COLOR_SVG
  readonly tag = 'button'
  readonly showDropPanel = true // 点击 button 时显示 dropPanel
  readonly mark = 'cellBg'
  private $content: Dom7Array | null = null

  exec(editor: IDomEditor, value: string | boolean) {
    
    // 点击菜单时，弹出 droPanel 之前，不需要执行其他代码
    // 此处空着即可
  }

  getValue(editor: IDomEditor): string | boolean {
    const mark = this.mark
    const curMarks = Editor.marks(editor)
    // @ts-ignore
    if (curMarks && curMarks[mark]) return curMarks[mark]
    return ''
  }

  isActive(editor: IDomEditor): boolean {
    const color = this.getValue(editor)
    return !!color
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) return true

    const [match] = Editor.nodes(editor, {
      match: n => {
        const type = DomEditor.getNodeType(n)

        if (type === 'pre') return true // 代码块
        if (Editor.isVoid(editor, n)) return true // void node

        return false
      },
      universal: true,
    })

    // 命中，则禁用
    if (match) return true
    return false
  }

  getPanelContentElem(editor: IDomEditor): DOMElement {
    const mark = this.mark

    if (this.$content == null) {
      // 第一次渲染
      const $content = $('<ul class="w-e-panel-content-color"></ul>')

      // 绑定事件（只在第一次绑定，不要重复绑定）
      $content.on('click', 'li', (e: Event) => {
        const { target } = e
        if (target == null) return
        e.preventDefault()

        const { selection } = editor
        if (selection == null) return

        const $li = $(target)
        const val = $li.attr('data-value')

        // 修改文本样式
        if (val === '0') {
          Editor.removeMark(editor, mark)
        } else {
          // Editor.addMark(editor, mark, val)
          console.log("choosen color", val);
          const [cellEntry] = Editor.nodes(editor, {
            match: n => DomEditor.checkNodeType(n, 'table-cell'),
            universal: true,
          })
          const [selectedCellNode, selectedCellPath] = cellEntry
          console.log("selectedCellNode", selectedCellNode);
          const props: Partial<TableCellElement> = {
            backgroundColor: val,
          }
          
          Transforms.setNodes(editor, props, { mode: 'highest', at: selectedCellPath })
        }
      })

      $content.on('change', 'input', (e: any) => {
        console.log("change color: ", e.target.value);
        const [cellEntry] = Editor.nodes(editor, {
          match: n => DomEditor.checkNodeType(n, 'table-cell'),
          universal: true,
        })
        const [selectedCellNode, selectedCellPath] = cellEntry
        console.log("selectedCellNode", selectedCellNode);
        const props: Partial<TableCellElement> = {
          backgroundColor: e.target.value,
        }
        
        Transforms.setNodes(editor, props, { mode: 'highest', at: selectedCellPath })
      });

      this.$content = $content
    }
    const $content = this.$content
    if ($content == null) return document.createElement('ul')
    $content.empty() // 清空之后再重置内容

    // 当前选中文本的颜色之
    const selectedColor = this.getValue(editor)

    // 获取菜单配置
    const colorConf = editor.getMenuConfig("color")
    const { colors = [] } = colorConf
    // 根据菜单配置生成 panel content
    colors.forEach((color: string) => {
      const $block = $(`<div class="color-block" data-value="${color}"></div>`)
      $block.css('background-color', color)

      const $li = $(`<li data-value="${color}"></li>`)
      if (selectedColor === color) {
        $li.addClass('active')
      }
      $li.append($block)

      $content.append($li)
    })

    const $colorSelect = $(`<div><input style="width: 100%;" type="color" /></div>`);
    $content.append($colorSelect)


    // 清除颜色
    let clearText = ''
    // if (mark === 'color') clearText = t('color.default')
    // if (mark === 'bgColor') clearText = t('color.clear')
    // const $clearLi = $(`
    //   <li data-value="0" class="clear">
    //     ${CLEAN_SVG}
    //     ${clearText}
    //   </li>
    // `)
    // $content.prepend($clearLi)

    return $content[0]
  }
}



export default CellColor
