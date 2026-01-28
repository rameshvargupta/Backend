import PDFDocument from "pdfkit";

export const generateInvoicePDF = (order, user, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Pipe to response
  doc.pipe(res);

  /* ================= LOGO ================= */
  doc
    .fontSize(22)
    .fillColor("#000")
    .text("GT SHOP", 50, 40);

  doc
    .fontSize(10)
    .text("GSTIN: 27ABCDE1234F1Z5", 50, 70)
    .text("Email: support@gtshop.com", 50, 85);

  /* ================= INVOICE INFO ================= */
  doc
    .fontSize(12)
    .text(`Invoice #: ${order._id}`, 400, 40)
    .text(`Date: ${new Date(order.createdAt).toDateString()}`, 400, 60);

  /* ================= USER DETAILS ================= */
  doc.moveDown(3);
  doc.fontSize(14).text("BILL TO", { underline: true });

  doc
    .fontSize(11)
    .text(user.firstName + " " + user.lastName)
    .text(order.addresses.address)
    .text(
      `${order.addresses.city}, ${order.addresses.state} - ${order.addresses.pincode}`
    )
    .text(`Mobile: ${order.addresses.phone}`);

  /* ================= PRODUCTS ================= */
  doc.moveDown(2);
  doc.fontSize(14).text("Order Details", { underline: true });

  let y = doc.y + 10;

  order.orderItems.forEach((item, index) => {
    doc
      .fontSize(11)
      .text(`${index + 1}. ${item.name}`, 50, y)
      .text(`Qty: ${item.quantity}`, 300, y)
      .text(`₹${item.price}`, 450, y);
    y += 20;
  });

  /* ================= TOTAL ================= */
  doc.moveDown(2);
  doc.fontSize(12).text(`Total Amount: ₹${order.totalAmount}`, {
    align: "right",
  });

  /* ================= FOOTER ================= */
  doc.moveDown(3);
  doc
    .fontSize(12)
    .fillColor("green")
    .text("🎉 Congratulations for shopping from GT Shop!", {
      align: "center",
    });

  doc
    .fontSize(10)
    .fillColor("gray")
    .text("Thank you for your trust. Visit again!", {
      align: "center",
    });

  doc.end();
};
