"use client"

import { useState } from 'react'
import QRCode from 'qrcode'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import TextareaAutosize from 'react-textarea-autosize'

export function calculateByteSize(str: string): number {
  return new Blob([str]).size;
}



export default function QREncoder() {
  const [htmlInput, setHtmlInput] = useState('')
  const [qrCodeData, setQrCodeData] = useState('')
  const [error, setError] = useState('')
  const [byteCount, setByteCount] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value
    setHtmlInput(newInput)
    setByteCount(calculateByteSize(newInput))
  }

  const minifyCode = async (code: string) => {
    const minifyApiReq = await fetch('/api/minify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html:code }),
    })
    const minifiedCode = await minifyApiReq.json()
    return minifiedCode.minifiedHtml
  }

  const generateQRCode = async () => {
    try {
      const qrCodeOptions = {
        errorCorrectionLevel: 'L',
        type: 'image/png',
        quality: 1,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        version: 40,
      }
      const minifiedHtml = await minifyCode(htmlInput)
      const compressedHtml = new CompressionStream('deflate-raw')
      const writer = compressedHtml.writable.getWriter()
      writer.write(new TextEncoder().encode(minifiedHtml))
      writer.close()

      const reader = compressedHtml.readable.getReader()
      const chunks = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(...value)
      }

      const base64Data = btoa(String.fromCharCode(...chunks))
      
      let decomScript = `<body><script>new Response(Uint8Array.from(atob("${base64Data}"),(e=>e.charCodeAt(0)))).body.pipeThrough(new DecompressionStream("deflate-raw")).getReader().read().then((({value:e})=>(document.open(),document.write((new TextDecoder).decode(e)),document.close()))).catch(console.error)</script>`
      let uriencodeddecomScript = encodeURIComponent(decomScript)
      let datauri = `data:text/html;charset=utf-8,${uriencodeddecomScript}`
      console.log(datauri)

      //@ts-ignore
      const qrCodeDataUrl = await QRCode.toDataURL(datauri, qrCodeOptions) as string
      setQrCodeData(qrCodeDataUrl)
      setError('')
    } catch (err) {
      setError('Error generating QR code. The input may be too large (max 2,953 bytes).')
      setQrCodeData('')
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Sandwich - HTML to QR Code Encoder (Version 40)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="htmlInput" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your HTML code:
          </label>
          <TextareaAutosize
            id="htmlInput"
            value={htmlInput}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            minRows={5}
            placeholder="Enter your HTML code here..."
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Byte count: {byteCount} / 2953 (this is not the maximum byte count for the html, it is going to be minified and compressed, try keeping it as low as possible)
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${Math.min((byteCount / 2953) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        <Button onClick={generateQRCode} className="w-full">
          Generate QR Code
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {qrCodeData && (
          <div className="flex justify-center">
            <img src={qrCodeData} alt="Generated QR Code" className="max-w-full h-auto" />
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Note: Version 40 QR codes can store up to 2,953 bytes of data.
      </CardFooter>
    </Card>
  )
}

