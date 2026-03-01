import{r as e}from"./rolldown-runtime-DGruFWvd.js";import{T as t,w as n}from"./react-query-Bs2h8zdQ.js";import{m as r}from"./vendor-react-g7Jl8uRT.js";import{t as i}from"./calendar-C08onGl7.js";import{t as a}from"./minus-C-n4mXmL.js";import{t as o}from"./plus-DmiBWoWH.js";import{h as s}from"./index-DnojQBUd.js";var c=s(`chart-column`,[[`path`,{d:`M3 3v16a2 2 0 0 0 2 2h16`,key:`c24i48`}],[`path`,{d:`M18 17V9`,key:`2bz60n`}],[`path`,{d:`M13 17V5`,key:`1frdt8`}],[`path`,{d:`M8 17v-3`,key:`17ska0`}]]),l=e(t(),1),u=n(),d=[{icon:o,label:`Receitas`,href:`/incomes`,color:`text-emerald-400 dark:text-emerald-400`,bg:`bg-emerald-50`,hover:`hover:bg-emerald-100`},{icon:a,label:`Gastos`,href:`/expenses`,color:`text-rose-400 dark:text-rose-400`,bg:`bg-rose-50`,hover:`hover:bg-rose-100`},{icon:i,label:`Compromissos`,href:`/commitments`,color:`text-amber-400 dark:text-amber-400`,bg:`bg-amber-50`,hover:`hover:bg-amber-100`},{icon:c,label:`Dashboard`,href:`/dashboard`,color:`text-blue-400 dark:text-blue-400`,bg:`bg-blue-50`,hover:`hover:bg-blue-100`}],f=l.memo(function(){return(0,u.jsxs)(`div`,{className:`py-4 px-6 bg-white dark:bg-gray-800 rounded-lg `,children:[(0,u.jsx)(`h3`,{className:`text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3`,children:`Ações rápidas`}),(0,u.jsx)(`div`,{className:`grid grid-cols-4 gap-4`,children:d.map(e=>{let t=e.icon;return(0,u.jsxs)(r,{to:e.href,className:`
                flex flex-col items-center gap-2 p-3 rounded-xl
                ${e.hover}
                hover:scale-105 active:scale-95
                transition-transform duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500
                group
              `,children:[(0,u.jsx)(`div`,{className:`
                ${e.color} 
                ${e.bg}
                bg-gray-50 dark:bg-gray-700
                p-3 rounded-full
                group-hover:shadow-md
                transition-shadow duration-200
              `,children:(0,u.jsx)(t,{className:`w-6 h-6`})}),(0,u.jsx)(`span`,{className:`
                  text-xs text-gray-600 dark:text-gray-300
                  text-center
                  group-hover:font-medium
                  group-hover:text-gray-800 dark:group-hover:text-gray-700
                  transition-colors duration-200
                `,children:e.label})]},e.href)})})]})});export{f as default};