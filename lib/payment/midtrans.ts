import Midtrans from 'midtrans-client'

const snap = new Midtrans.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
})

export interface MidtransPaymentData {
  orderId: string
  amount: number
  customerDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  itemDetails: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
}

export class MidtransService {
  static async createTransaction(data: MidtransPaymentData) {
    try {
      const parameter = {
        transaction_details: {
          order_id: data.orderId,
          gross_amount: data.amount,
        },
        customer_details: {
          first_name: data.customerDetails.firstName,
          last_name: data.customerDetails.lastName,
          email: data.customerDetails.email,
          phone: data.customerDetails.phone,
        },
        item_details: data.itemDetails,
        callbacks: {
          finish: `${process.env.NEXTAUTH_URL}/payment/success`,
          pending: `${process.env.NEXTAUTH_URL}/payment/pending`,
          error: `${process.env.NEXTAUTH_URL}/payment/error`,
        },
      }

      const transaction = await snap.createTransaction(parameter)
      
      return {
        success: true,
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      }
    } catch (error) {
      console.error('Midtrans transaction error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async getTransactionStatus(orderId: string) {
    try {
      const status = await snap.transaction.status(orderId)
      return {
        success: true,
        status: status.transaction_status,
        data: status,
      }
    } catch (error) {
      console.error('Midtrans status check error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async handleNotification(payload: any) {
    try {
      const status = await snap.transaction.notification(payload)
      
      return {
        success: true,
        orderId: status.order_id,
        status: status.transaction_status,
        fraudStatus: status.fraud_status,
        data: status,
      }
    } catch (error) {
      console.error('Midtrans notification error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static generateQRCode(orderId: string, amount: number) {
    // Generate QR code for payment
    const qrData = {
      orderId,
      amount,
      timestamp: Date.now(),
    }
    
    return {
      qrData: JSON.stringify(qrData),
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`,
    }
  }
}
