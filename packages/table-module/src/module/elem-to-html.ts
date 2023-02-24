/**
 * @description to html
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor/core'
import { Editor, Element } from 'slate'
import { TableCellElement, TableRowElement, TableElement } from './custom-types'

function tableToHtml(elemNode: Element, childrenHtml: string): string {
  const { width = 'auto' } = elemNode as TableElement

  return `<table class="wangeditor-element-table" style="width: ${width};"><tbody>${childrenHtml}</tbody></table>`
}

function tableRowToHtml(elem: Element, childrenHtml: string): string {
  return `<tr>${childrenHtml}</tr>`
}

function tableCellToHtml(cellNode: Element, childrenHtml: string, editor?: IDomEditor): string {
  const {
    colSpan = 1,
    rowSpan = 1,
    isHeader = false,
    width = 'auto',
  } = cellNode as TableCellElement
  // const tag = isHeader ? 'th' : 'td'
  const tag = isHeader ? 'td' : 'td'

  const cellDomNode = DomEditor.toDOMNode(editor!, cellNode)
  console.log('tableCellToHtml cellDomNode', cellNode, cellDomNode)
  const colspan = cellDomNode.getAttribute('colSpan') || 1
  const rowspan = cellDomNode.getAttribute('rowspan') || 1
  return `<${tag} colSpan="${colspan}" rowSpan="${rowspan}" width="${width}">${childrenHtml}</${tag}>`
}

export const tableToHtmlConf = {
  type: 'table',
  elemToHtml: tableToHtml,
}

export const tableRowToHtmlConf = {
  type: 'table-row',
  elemToHtml: tableRowToHtml,
}

export const tableCellToHtmlConf = {
  type: 'table-cell',
  elemToHtml: tableCellToHtml,
}
