import type { NextApiRequest, NextApiResponse } from "next"
import { minify } from 'html-minifier-terser'
//import { minify as minify_js } from "terser";


export async function POST(request: Request) {
  try {
    const { html } = await request.json()
    console.log(html)
        const terserOptions = {
          "module": true,
          "compress": {
            "passes": 5,
            "pure_funcs": ["console.log", "console.error"],
            "unsafe": true,
            "unsafe_arrows": true,
            "unsafe_comps": true,
            "unsafe_math": true,
            "unsafe_proto": true,
            "unsafe_regexp": true,
            "unsafe_symbols": true,
            "unsafe_methods": true,
            "keep_fargs": false,
            "drop_console": true,
            "drop_debugger": true,
            "reduce_funcs": true,
            "reduce_vars": true,
            "ecma": 2020,
            "toplevel": true,
            "inline": 3
          },
          "mangle": {
            "toplevel": true,
            "properties": {
              "regex": "^[a-zA-Z_]",
              "keep_quoted": false
            }
          },
          "output": {
            "ecma": 2020,
            "comments": false,
            "beautify": false,
            "quote_style": 3,
            "wrap_func_args": false
          },
          "parse": {
            "ecma": 2020
          },
          "rename": {
            "builtins": true,
            "globals": true,
            "properties": true
          }
        }
        
        const htmlMinifierOptions = {
          "removeComments": true,
          "collapseWhitespace": true,
          "removeAttributeQuotes": true,
          "minifyCSS": true,
          "minifyJS": terserOptions,
          "removeOptionalTags": true,
          "removeEmptyAttributes": true,
          "collapseBooleanAttributes": true,
          "removeRedundantAttributes": true,
          "useShortDoctype": true,
          "sortAttributes": true,
          "sortClassName": true,
          "removeScriptTypeAttributes": true,
          "removeStyleLinkTypeAttributes": true,
          "decodeEntities": true,
          "processConditionalComments": true,
          "trimCustomFragments": true,
          "removeTagWhitespace": false, // This is set to false to prevent invalid HTML 
          "preventAttributesEscaping": true,
          "customEventAttributes": [/^on[a-z]{3,}$/],
          "html5": true
        }
        
         const minifiedHtml = await minify(html, htmlMinifierOptions)
         return new Response(JSON.stringify({minifiedHtml}), {
          status: 200,
        })
    
  } catch (error) {
    return new Response('Error', {
      status: 400,
    })
  }
 
}