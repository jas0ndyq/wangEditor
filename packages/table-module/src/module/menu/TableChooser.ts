/**
 * @description table header menu
 * @author wangfupeng
 */

import { Transforms, Range } from 'slate'
import { IButtonMenu, IDomEditor, DomEditor, t } from '@wangeditor/core'
import { CELL_CHOOSE_SVG } from '../../constants/svg'
import { TableElement } from '../custom-types'
import { getFirstRowCells, isTableWithChooser } from '../helpers'
import {
  regTableMouseMoveEvent,
  unbindTableMouseEvent,
} from '@wangeditor/table-module/src/utils/table'

class TableChooser implements IButtonMenu {
  readonly title = t('tableModule.chooser')
  readonly iconSvg = CELL_CHOOSE_SVG
  readonly tag = 'button'
  eventObj: any
  // 是否已设置表头
  getValue(editor: IDomEditor): string | boolean {
    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement
    if (tableNode == null) return false

    return isTableWithChooser(tableNode)
  }

  isActive(editor: IDomEditor): boolean {
    return !!this.getValue(editor)
  }

  isDisabled(editor: IDomEditor): boolean {
    const { selection } = editor
    if (selection == null) return true
    if (!Range.isCollapsed(selection)) return true

    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table')
    if (tableNode == null) {
      // 选区未处于 table node ，则禁用
      return true
    }
    return false
  }

  exec(editor: IDomEditor, value: string | boolean) {
    if (this.isDisabled(editor)) return

    // 已经设置了表头，则取消。未设置表头，则设置
    const newValue = value ? false : true

    // 获取第一行所有 cell
    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement

    if (tableNode == null) return
    console.log('tableNode is: ', tableNode, DomEditor.toDOMNode(editor, tableNode))
    const tableDomNode = DomEditor.toDOMNode(editor, tableNode).querySelector('table')!
    if (!tableDomNode) {
      return
    }
    if (newValue) {
      this.eventObj = regTableMouseMoveEvent(tableDomNode)
    } else {
      console.log('this.eventObj', this.eventObj)
      unbindTableMouseEvent(tableDomNode, this.eventObj)
    }
    Transforms.setNodes(
      editor,
      { isChooser: newValue },
      {
        at: DomEditor.findPath(editor, tableNode),
      }
    )
  }
}

export default TableChooser