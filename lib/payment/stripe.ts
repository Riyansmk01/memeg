import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export interface PaymentIntentData {
  amount: number
  currency: string
  customerId?: string
  metadata?: Record<string, string>
}

export class StripeService {
  static async createPaymentIntent(data: PaymentIntentData) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        customer: data.customerId,
        metadata: data.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }
    } catch (error) {
      console.error('Stripe payment intent error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async createCustomer(email: string, name: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      })

      return {
        success: true,
        customerId: customer.id,
      }
    } catch (error) {
      console.error('Stripe customer creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async createSubscription(customerId: string, priceId: string) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })

      return {
        success: true,
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      }
    } catch (error) {
      console.error('Stripe subscription error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async handleWebhook(payload: string, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      )

      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaymentSuccess(event.data.object as Stripe.Invoice)
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Stripe webhook error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // Update payment status in database
    console.log('Payment succeeded:', paymentIntent.id)
    return { success: true }
  }

  private static async handleInvoicePaymentSuccess(invoice: Stripe.Invoice) {
    // Update subscription status in database
    console.log('Invoice payment succeeded:', invoice.id)
    return { success: true }
  }

  private static async handleSubscriptionCancelled(subscription: Stripe.Subscription) {
    // Update subscription status in database
    console.log('Subscription cancelled:', subscription.id)
    return { success: true }
  }
}
