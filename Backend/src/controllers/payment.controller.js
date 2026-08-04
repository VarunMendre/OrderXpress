const { validateRazorpayOrderPayload, validateWebhookPayload } = require('../validators/payment.schema');
const { createRazorpayOrder, verifyRazorpayPayment, handleWebhook, markCashPaid } = require('../services/payment.service');

async function razorpayOrder(req, res, next) {
  try {
    const validation = validateRazorpayOrderPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }

    const data = await createRazorpayOrder(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function verify(req, res, next) {
  try {
    const data = await verifyRazorpayPayment(req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function webhook(req, res, next) {
  try {
    const validation = validateWebhookPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }

    const signature = req.headers['x-razorpay-signature'] || '';
    const data = await handleWebhook(req.body, signature);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function cashPaid(req, res, next) {
  try {
    const data = await markCashPaid(req.auth.adminId, req.params.orderId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { razorpayOrder, verify, webhook, cashPaid };
