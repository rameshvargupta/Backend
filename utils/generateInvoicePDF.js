import PDFDocument from "pdfkit";

export const generateInvoicePDF = (order, user, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(res);

  const format = (amt) => `₹${Number(amt || 0).toLocaleString("en-IN")}`;

  /* ================= COMPANY HEADER ================= */
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("GT SHOP", 40, 40);

  doc
    .fontSize(9)
    .font("Helvetica")
    .text("GSTIN: 27ABCDE1234F1Z5", 40, 60)
    .text("Email: support@gtshop.com", 40, 72);

  doc
    .fontSize(10)
    .text(`Invoice No: ${order._id}`, 350, 40)
    .text(
      `Invoice Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
      350,
      55
    );

  /* ================= BILL + SHIPPING ================= */
  doc.moveDown(4);

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Bill To:", 40, 110);

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(`${user.firstName} ${user.lastName}`, 40, 125)
    .text(order.addresses.address, 40, 140, { width: 250 })
    .text(
      `${order.addresses.city}, ${order.addresses.state} - ${order.addresses.pincode}`,
      40,
      160
    )
    .text(`Mobile: ${order.addresses.phone}`, 40, 175);

  doc
    .font("Helvetica-Bold")
    .text("Order Info:", 350, 110);

  doc
    .font("Helvetica")
    .text(`Order Status: ${order.orderStatus}`, 350, 125)
    .text(`Payment: ${order.paymentMethod}`, 350, 140)
    .text(
      `Delivered: ${
        order.deliveredAt
          ? new Date(order.deliveredAt).toLocaleDateString("en-IN")
          : "Pending"
      }`,
      350,
      155
    );

  /* ================= TABLE ================= */
  let tableTop = 220;

  // Table Header
  doc.rect(40, tableTop, 520, 20).stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("S.No", 45, tableTop + 5)
    .text("Product", 90, tableTop + 5)
    .text("Qty", 300, tableTop + 5)
    .text("Price", 340, tableTop + 5)
    .text("Discount", 410, tableTop + 5)
    .text("Total", 480, tableTop + 5);

  let y = tableTop + 25;

  let subtotal = 0;
  let totalDiscount = 0;

  /* ================= ROWS ================= */
  order.orderItems.forEach((item, index) => {
    const name =
      item.productName ||
      item?.productId?.name ||
      "Product";

    const qty = item.quantity;
    const price = item.price;
    const discount = item.discount || 0;
    const total = price * qty - discount;

    subtotal += price * qty;
    totalDiscount += discount;

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(index + 1, 45, y)
      .text(name, 90, y, { width: 200 })
      .text(qty, 300, y)
      .text(format(price), 340, y)
      .text(format(discount), 410, y)
      .text(format(total), 480, y);

    y += 20;

    // row border
    doc
      .moveTo(40, y)
      .lineTo(560, y)
      .stroke();
  });

  /* ================= CALCULATION ================= */
  const shipping = subtotal > 999 ? 0 : 49;
  const coupon = order.couponDiscount || 0;

  const finalTotal =
    subtotal - totalDiscount - coupon + shipping;

  let summaryTop = y + 20;

  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Subtotal:", 350, summaryTop)
    .text(format(subtotal), 480, summaryTop);

  doc
    .text("Product Discount:", 350, summaryTop + 15)
    .text(`- ${format(totalDiscount)}`, 480, summaryTop + 15);

  doc
    .text("Coupon Discount:", 350, summaryTop + 30)
    .text(`- ${format(coupon)}`, 480, summaryTop + 30);

  doc
    .text("Shipping:", 350, summaryTop + 45)
    .text(
      shipping === 0 ? "Free" : format(shipping),
      480,
      summaryTop + 45
    );

  // Total box
  doc
    .rect(350, summaryTop + 65, 210, 25)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Total Amount", 355, summaryTop + 72)
    .text(format(finalTotal), 480, summaryTop + 72);

  /* ================= FOOTER ================= */
  doc.moveDown(5);

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "This is a system generated invoice. No signature required.",
      40,
      720
    );

  doc
    .fontSize(10)
    .text("Thank you for shopping with GT Shop!", 40, 735);

  doc.end();
};