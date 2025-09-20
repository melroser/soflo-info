'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Zap, MessageSquare, Shield, Satellite, Users } from 'lucide-react'
import EmergencyForm from '@/components/EmergencyForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'


export default function HomePage() {

  const features = [
    {
      icon: Zap,
      title: 'AI-Enhanced Messages',
      description: 'Intelligent context-aware emergency communications'
    },
    {
      icon: Satellite,
      title: 'Low-Bandwidth Optimized',
      description: 'Designed for limited connectivity scenarios'
    },
    {
      icon: Shield,
      title: 'Crisis-Ready',
      description: 'Built specifically for hurricane and disaster response'
    },
    {
      icon: Users,
      title: 'Mass Coordination',
      description: 'Coordinate emergency response across multiple contacts'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <AlertTriangle className="h-20 w-20 text-red-500 pulse-emergency" />
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              Crisis<span className="text-red-500">Link</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto"
            >
              AI-powered emergency SMS platform for crisis communication when every message matters
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
<Badge variant="secondary" className="bg-white/10 text-white border-white/20">
    <Zap className="w-4 h-4 mr-2" />
    AI-Enhanced
</Badge>
<Badge variant="secondary" className="bg-white/10 text-white border-white/20">
    <Satellite className="w-4 h-4 mr-2" />
    Low-Bandwidth
</Badge>
<Badge variant="secondary" className="bg-white/10 text-white border-white/20">
    <MessageSquare className="w-4 h-4 mr-2" />
    Crisis-Ready
</Badge>


            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Emergency Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <EmergencyForm />
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built for Crisis Communication
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            When traditional communication fails, CrisisLink ensures your emergency messages get through with AI-powered optimization
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
            >
<Card className="bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition-colors rounded-2xl">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

