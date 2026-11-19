import type { Subject } from '../data/subjects'

export const tintTile: Record<Subject['tint'], string> = {
  violet: 'bg-brand-soft text-brand-ink',
  blue: 'bg-[#e9f0ff] text-[#2a56a6] dark:bg-[#131c2e] dark:text-[#a3c0f7]',
  teal: 'bg-[#e4f4f0] text-[#0d6a56] dark:bg-[#0f241f] dark:text-[#82d4bd]',
  amber: 'bg-[#faf0da] text-[#8a5a12] dark:bg-[#261e11] dark:text-[#e3bd76]',
  rose: 'bg-[#fcebed] text-[#9a3450] dark:bg-[#28151b] dark:text-[#f0a6b6]',
}

export const tintDot: Record<Subject['tint'], string> = {
  violet: 'bg-brand',
  blue: 'bg-[#3f6fd4] dark:bg-[#8bb0f2]',
  teal: 'bg-[#158772] dark:bg-[#6ac7b0]',
  amber: 'bg-[#bb8226] dark:bg-[#dcb268]',
  rose: 'bg-[#b04762] dark:bg-[#e291a4]',
}
