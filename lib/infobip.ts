export interface InfobipMessage {
  destinations: { to: string }[]
  from: string
  text: string
}

export interface InfobipResponse {
  messages: {
    messageId: string
    status: {
      groupId: number
      groupName: string
      id: number
      name: string
      description: string
    }
    destination: string
  }[]
}

export class InfobipClient {
  private apiKey: string
  private baseUrl = 'https://api.infobip.com'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendSMS(message: InfobipMessage): Promise<InfobipResponse> {
    const response = await fetch(`${this.baseUrl}/sms/2/text/advanced`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ messages: [message] })
    })

    if (!response.ok) {
      throw new Error(`Infobip API error: ${response.statusText}`)
    }

    return response.json()
  }
}

