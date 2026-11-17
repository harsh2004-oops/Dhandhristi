
import React, { useState } from "react";
import axios from "axios";

const OCR_API = "http://127.0.0.1:8000/api/invoices/upload";

function InvoiceOCR() {
    const [invoice, setInvoice] = useState(null);
    const [invoiceType, setInvoiceType] = useState("purchase");
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [invoiceData, setInvoiceData] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setInvoice(file);
        setPreview(URL.createObjectURL(file));
        setInvoiceData(null);
        setError("");
    };

    const handleUpload = async () => {
        if (!invoice) {
            setError("Please select an invoice first.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const formData = new FormData();
            formData.append("invoice", invoice);
            formData.append("invoice_type", invoiceType);

            const response = await axios.post(
                OCR_API,
                formData
            );

            setInvoiceData(response.data.extracted_data);

        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to process invoice. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateItem = (index, field, value) => {
        setInvoiceData(prev => {
            const items = [...prev.items];

            items[index] = {
                ...items[index],
                [field]: field === "name" ? value : Number(value),
            };

            items[index].amount =
                Number(items[index].quantity || 0) *
                Number(items[index].unit_price || 0);

            return { ...prev, items };
        });
    };

    const addItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    name: "",
                    quantity: 1,
                    unit_price: 0,
                    amount: 0
                }
            ]
        }));
    };

    const removeItem = (index) => {
        setInvoiceData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const styles = {
        page: {
            padding: "25px",
            color: "#1f2937"
        },
        card: {
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            marginBottom: "20px"
        },
        input: {
            width: "100%",
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            marginTop: "6px",
            boxSizing: "border-box"
        },
        button: {
            padding: "11px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
        },
        grid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px"
        }
    };

    return (
        <div style={styles.page}>
            <h2>Invoice OCR</h2>
            <p>Upload your purchase or sales invoice to extract details.</p>

            <div style={styles.card}>
                <h3>Upload Invoice</h3>

                <label>Invoice Type</label>
                <select
                    style={styles.input}
                    value={invoiceType}
                    onChange={e => {
                        setInvoiceType(e.target.value);
                        setInvoiceData(null);
                    }}
                >
                    <option value="purchase">Purchase Invoice</option>
                    <option value="sales">Sales Invoice</option>
                </select>

                <br /><br />

                <label>Select Invoice (JPG, PNG or PDF)</label>
                <input
                    style={styles.input}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                />

                {invoice && (
                    <p>Selected: {invoice.name}</p>
                )}

                <button
                    style={styles.button}
                    onClick={handleUpload}
                    disabled={loading}
                >
                    {loading ? "Processing OCR..." : "Upload and Extract"}
                </button>

                {error && (
                    <p style={{ color: "red", marginTop: "12px" }}>
                        {error}
                    </p>
                )}
            </div>

            {preview && (
                <div style={styles.card}>
                    <h3>Original Invoice</h3>

                    {invoice?.type === "application/pdf" ? (
                        <iframe
                            src={preview}
                            title="Original Invoice"
                            width="100%"
                            height="500px"
                        />
                    ) : (
                        <img
                            src={preview}
                            alt="Invoice Preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "500px",
                                objectFit: "contain"
                            }}
                        />
                    )}
                </div>
            )}

            {invoiceData && (
                <div style={styles.card}>
                    <h3>Review Extracted Details</h3>
                    <p style={{ color: "#d97706" }}>
                        Please verify and edit the extracted information.
                        Nothing is saved to the database yet.
                    </p>

                    <div style={styles.grid}>
                        <div>
                            <label>Invoice Number</label>
                            <input
                                style={styles.input}
                                value={invoiceData.invoice_number || ""}
                                onChange={e => updateField(
                                    "invoice_number", e.target.value
                                )}
                            />
                        </div>

                        <div>
                            <label>Invoice Date</label>
                            <input
                                style={styles.input}
                                value={invoiceData.invoice_date || ""}
                                onChange={e => updateField(
                                    "invoice_date", e.target.value
                                )}
                            />
                        </div>

                        <div>
                            <label>Supplier</label>
                            <input
                                style={styles.input}
                                value={invoiceData.supplier || ""}
                                onChange={e => updateField(
                                    "supplier", e.target.value
                                )}
                            />
                        </div>

                        <div>
                            <label>Customer</label>
                            <input
                                style={styles.input}
                                value={invoiceData.customer || ""}
                                onChange={e => updateField(
                                    "customer", e.target.value
                                )}
                            />
                        </div>
                    </div>

                    <h3>Products</h3>

                    {invoiceData.items?.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.grid,
                                alignItems: "end",
                                marginBottom: "15px"
                            }}
                        >
                            <div>
                                <label>Product Name</label>
                                <input
                                    style={styles.input}
                                    value={item.name}
                                    onChange={e => updateItem(
                                        index, "name", e.target.value
                                    )}
                                />
                            </div>

                            <div>
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    style={styles.input}
                                    value={item.quantity}
                                    onChange={e => updateItem(
                                        index, "quantity", e.target.value
                                    )}
                                />
                            </div>

                            <div>
                                <label>Unit Price</label>
                                <input
                                    type="number"
                                    style={styles.input}
                                    value={item.unit_price}
                                    onChange={e => updateItem(
                                        index, "unit_price", e.target.value
                                    )}
                                />
                            </div>

                            <div>
                                <label>Amount</label>
                                <input
                                    style={styles.input}
                                    value={item.amount}
                                    readOnly
                                />
                            </div>

                            <button
                                style={{
                                    ...styles.button,
                                    background: "#dc2626"
                                }}
                                onClick={() => removeItem(index)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    <button style={styles.button} onClick={addItem}>
                        + Add Product
                    </button>

                    <hr style={{ margin: "20px 0" }} />

                    <p>Subtotal: ₹{invoiceData.subtotal ?? 0}</p>
                    <p>GST: ₹{invoiceData.gst ?? 0}</p>
                    <h3>Grand Total: ₹{invoiceData.grand_total ?? 0}</h3>

                    <p style={{ color: "#d97706" }}>
                        Review screen only. Database saving will be added
                        after product and supplier/customer matching.
                    </p>
                </div>
            )}
        </div>
    );
}

export default InvoiceOCR;
