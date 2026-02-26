import{T as e,w as t}from"./react-query-Bs2h8zdQ.js";var n=e();function r(e){let t=(0,n.useRef)(null),r=(0,n.useRef)(null);return(0,n.useEffect)(()=>{if(!e)return;r.current=document.activeElement;let n=t.current;if(!n)return;let i=[`a[href]`,`input:not([disabled])`,`select:not([disabled])`,`textarea:not([disabled])`,`button:not([disabled])`,`[tabindex]:not([tabindex="-1"])`,`[role="button"]`,`[data-focusable="true"]`].join(`, `),a=Array.from(n.querySelectorAll(i));a.length>1?a[1].focus():a[0]?.focus();function o(e){if(e.key!==`Tab`||!n)return;let t=Array.from(n.querySelectorAll(i));if(t.length===0)return;let r=t[0],a=t[t.length-1];if(e.shiftKey&&document.activeElement===r){e.preventDefault(),a.focus();return}if(!e.shiftKey&&document.activeElement===a){e.preventDefault(),r.focus();return}}return document.addEventListener(`keydown`,o),()=>{document.removeEventListener(`keydown`,o),r.current?.focus()}},[e]),t}var i=t();function a({isOpen:e,onClose:t,title:a,children:o,type:s,onSave:c,onDelete:l,isLoading:u=!1,loadingText:d=`Salvando...`}){let f=r(e);return(0,n.useEffect)(()=>{if(!e)return;function n(e){e.key===`Escape`&&!u&&t()}return document.addEventListener(`keydown`,n),()=>document.removeEventListener(`keydown`,n)},[e,u,t]),e?(0,i.jsxs)(`div`,{className:`fixed inset-0 z-50 flex justify-center items-end md:items-center`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":a?`modal-titulo`:void 0,children:[(0,i.jsx)(`div`,{className:`absolute inset-0 bg-black/40 dark:bg-black/70`,onClick:u?void 0:t}),(0,i.jsxs)(`div`,{ref:f,className:`relative w-full md:w-[400px] max-h-[90vh] bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl flex flex-col`,children:[a&&(0,i.jsxs)(`div`,{className:`flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0`,children:[(0,i.jsx)(`h2`,{id:`modal-titulo`,className:`text-lg font-semibold text-gray-900 dark:text-gray-100`,children:a}),(0,i.jsx)(`button`,{onClick:u?void 0:t,disabled:u,"aria-label":`Fechar modal`,className:`text-sm text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition
                        ${u?`opacity-50 cursor-not-allowed`:``}`,children:`Fechar`})]}),(0,i.jsx)(`div`,{className:`px-6 pb-6 pt-4 overflow-y-auto flex-1`,children:o}),(0,i.jsxs)(`div`,{className:`flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex-shrink-0`,children:[(0,i.jsx)(`button`,{onClick:t,disabled:u,"aria-label":`Cancelar e fechar modal`,className:`
                     flex-1 rounded-lg p-2 text-sm font-medium
                     border border-gray-600
                     text-gray-300
                     bg-gray-800
                     hover:bg-gray-700
                     hover:scale-105 transition-all duration-200
                     transition-all duration-200
                     active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed
                  `,children:`Cancelar`}),s===`edit`&&l&&(0,i.jsx)(`button`,{onClick:l,type:`button`,disabled:u,"aria-label":`Excluir registro permanentemente`,className:`
                        flex-1 rounded-lg p-2 text-sm font-medium
                        bg-rose-600
                        hover:bg-rose-700
                        hover:scale-105 transition-all duration-200
                        text-white
                        transition-all duration-200
                        active:scale-[0.98]
                        disabled:opacity-50 disabled:cursor-not-allowed
                     `,children:u&&d===`Excluindo...`?`Excluindo...`:`Excluir`}),c&&(0,i.jsx)(`button`,{onClick:c,"aria-label":s===`create`?`Salvar novo registro`:`Salvar alterações`,type:`button`,disabled:u,className:`
                        flex-1 rounded-lg p-2 text-sm font-medium
                        bg-emerald-600
                        hover:bg-emerald-700
                        hover:scale-105 transition-all duration-200
                        text-white
                        shadow-md shadow-emerald-900/20
                        transition-all duration-200
                        active:scale-[0.98]
                        disabled:opacity-50 disabled:cursor-not-allowed
                     `,children:u&&d!==`Excluindo...`?d:`Salvar`})]})]})]}):null}export{r as n,a as t};