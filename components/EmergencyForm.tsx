'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, CheckCircle, AlertCircle, Sparkles, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
  enhancedMessage?: string
}

export default function EmergencyForm() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [enhancedMessage, setEnhancedMessage] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)

  const handleEnhanceMessage = async () => {
    if (!message.trim()) return

    setIsEnhancing(true)
    try {
      const response = await fetch('/api/enhance-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      })

      const data = await response.json()
      if (data.success) {
        setEnhancedMessage(data.enhancedMessage)
      }
    } catch (error) {
      console.error('Enhancement failed:', error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleSendSMS = async () => {
    if (!phoneNumber.trim() || !message.trim()) return

    setIsSending(true)
    setSendResult(null)

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          message: enhancedMessage || message.trim()
        })
      })

      const data = await response.json()
      setSendResult(data)
    } catch {
      setSendResult({
        success: false,
        error: 'Network error occurred'
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
<Card className="rounded-2xl bg-slate-900/70 backdrop-blur-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-500" />
          Emergency Message Center
        </CardTitle>
        <CardDescription className="text-slate-300">
          Send AI-enhanced emergency communications via SMS
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Phone Number Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Recipient Phone Number
          </label>
          <Input
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Emergency Message
          </label>
          <Textarea
            placeholder="Describe the emergency situation..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
          />
        </div>

        {/* AI Enhancement */}
        <div className="flex gap-3">
          <Button
            onClick={handleEnhanceMessage}
            disabled={!message.trim() || isEnhancing}
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
          >
            {isEnhancing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
          </Button>
        </div>

        {/* Enhanced Message Preview */}
        <AnimatePresence>
          {enhancedMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              </div>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <p className="text-slate-200 text-sm leading-relaxed">
                  {enhancedMessage}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send Button */}
        <Button
          onClick={handleSendSMS}
          disabled={!phoneNumber.trim() || !message.trim() || isSending}
          className="w-full emergency-gradient hover:opacity-90 text-white font-semibold py-3"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {isSending ? 'Sending Emergency SMS...' : 'Send Emergency SMS'}
        </Button>

        {/* Send Result */}
        <AnimatePresence>
          {sendResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg border ${
                sendResult.success
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {sendResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {sendResult.success ? 'Message Sent Successfully!' : 'Send Failed'}
                </span>
              </div>
              {sendResult.messageId && (
                <p className="text-sm mt-1 opacity-80">
                  Message ID: {sendResult.messageId}
                </p>
              )}
              {sendResult.error && (
                <p className="text-sm mt-1">
                  {sendResult.error}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

