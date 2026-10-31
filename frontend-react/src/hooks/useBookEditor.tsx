import { useState } from 'react'
import { Field, FormModal } from '../components/FormModal'
import { useStore } from '../context/StoreContext'
import { Book } from '../types'

const BF: Field[] = [{ k: 'name', label: 'Tên sách' }, { k: 'author', label: 'Tác giả' }, { k: 'cat', label: 'Thể loại' }, { k: 'qty', label: 'Số lượng', type: 'number' }, { k: 'img', label: 'Ảnh bìa', type: 'img' }, { k: 'desc', label: 'Giới thiệu ngắn (không bắt buộc)', opt: true }]

export function useBookEditor() {
  const { saveBook } = useStore()
  const [ed, setEd] = useState<Partial<Book> | null>(null)
  const save = (v: Record<string, string>) => saveBook(ed!.id, v)
  const modal = ed && <FormModal title={ed.id ? 'Sửa sách' : 'Thêm sách'} fields={BF} init={ed} onSave={save} onClose={() => setEd(null)} />
  return { open: setEd, modal }
}
