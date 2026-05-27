import React, { useState, useEffect } from "react";
import API from "../../services/api";

const INCOTERMS = ["DAP", "EXW", "CIF", "CIP", "CFR", "CPT", "DAT", "DDP", "FAS", "FCA", "FOB"];

export default function Step1({ initial = {}, onNext, onUpdate = () => {} }) {
  const [form, setForm] = useState({
    enquiry_no: "",
    supplier_name: "",
    ff: "",
    customer: "",
    invoice_no: "",
    invoice_date: "",
    dispatch_date: "",
    mode: "Sea",
    incoterm: "",
    sb_no: "",
    sb_date: "",
    // Dynamic Parts Array
    parts: initial.parts || [
      {
        part_no: "",
        part_desc: "",
        part_qty: 0,
        part_net_unit: 0,
        part_gross: 0,
        part_total_net_wt: 0,
        part_box_size: "",
        part_no_of_boxes: 0,    // ← new field
      },
    ],
    // Calculated Totals
    total_net_wt: 0,
    total_gross_wt: 0,
    total_no_of_boxes: 0,       // ← replaces total_pkg_wt & total parts count
    ...initial,
  });

  /* ─── Auto-fetch enquiry number on Create mode ─── */
  useEffect(() => {
    if (!form.enquiry_no) {
      const fetchNextNumber = async () => {
        try {
          const response = await API.get("/shipment/enquiry-number");
          if (response.data?.enquiryNo) {
            setForm((prev) => ({ ...prev, enquiry_no: response.data.enquiryNo }));
          }
        } catch (err) {
          console.error("Failed to fetch enquiry number:", err);
        }
      };
      fetchNextNumber();
    }
  }, []);

  /* ─── Totals Calculation ─── */
  useEffect(() => {
    let aggregateNet = 0;
    let aggregateGross = 0;
    let aggregateBoxes = 0;
    let aggregateQty = 0;

    form.parts.forEach((p) => {
      aggregateNet   += Number(p.part_qty || 0) * Number(p.part_net_unit || 0);
      aggregateGross += Number(p.part_gross || 0);
      aggregateBoxes += Number(p.part_no_of_boxes || 0);  // ← sum each part's No. of Boxes
      aggregateQty   += Number(p.part_qty || 0);
    });

    const updatedForm = {
      ...form,
      total_qty: aggregateQty,
      total_net_wt: aggregateNet.toFixed(2),
      total_gross_wt: aggregateGross.toFixed(2),
      total_no_of_boxes: aggregateBoxes,            // ← replaces total_pkg_wt
    };

    setForm(updatedForm);
    onUpdate(updatedForm);
  }, [form.parts]);

  /* ─── Part field change handler ─── */
  const handlePartChange = (index, e) => {
    const { name, value } = e.target;
    const updatedParts = [...form.parts];
    updatedParts[index] = { ...updatedParts[index], [name]: value };

    // Auto-calculate Total Net Wt = Qty × Net Wt/Unit
    // Only recalc if the user didn't directly edit part_total_net_wt
    if (name === "part_qty" || name === "part_net_unit") {
      const qty     = name === "part_qty"      ? Number(value) : Number(updatedParts[index].part_qty     || 0);
      const netUnit = name === "part_net_unit" ? Number(value) : Number(updatedParts[index].part_net_unit || 0);
      updatedParts[index].part_total_net_wt = (qty * netUnit).toFixed(2);
    }

    setForm((prev) => ({ ...prev, parts: updatedParts }));
  };

  const addPart = () => {
    setForm((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        {
          part_no: "",
          part_desc: "",
          part_qty: 0,
          part_net_unit: 0,
          part_gross: 0,
          part_total_net_wt: 0,
          part_box_size: "",
          part_no_of_boxes: 0,   // ← new field
        },
      ],
    }));
  };

  const removePart = (index) => {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
    }));
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="step-form">
      <h3 className="step-title">Step 1 — Shipment Details</h3>

      {/* ── Common Fields ── */}

      {/* Row 1: Enquiry No + FF */}
      <div className="form-grid">
        <div className="field">
          <label>Enquiry No</label>
          <input className="input" value={form.enquiry_no} readOnly />
        </div>
        {/* ✅ FF — added after Enquiry No */}
        <div className="field">
          <label>FF</label>
          <input className="input" name="ff" value={form.ff} onChange={change} placeholder="Freight Forwarder" />
        </div>
      </div>

      {/* Row 2: Supplier Name + Customer */}
      <div className="form-grid">
        <div className="field">
          <label>Supplier Name</label>
          <input className="input" name="supplier_name" value={form.supplier_name} onChange={change} />
        </div>
        <div className="field">
          <label>Customer</label>
          <input className="input" name="customer" value={form.customer} onChange={change} />
        </div>
      </div>

      {/* ✅ Row 3: Invoice No + Invoice Date — added after Customer */}
      <div className="form-grid">
        <div className="field">
          <label>Invoice No</label>
          <input className="input" name="invoice_no" value={form.invoice_no} onChange={change} />
        </div>
        <div className="field">
          <label>Invoice Date</label>
          <input className="input" type="date" name="invoice_date" value={form.invoice_date} onChange={change} />
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Incoterm</label>
          <select className="input" name="incoterm" value={form.incoterm} onChange={change}>
            <option value="">Select Incoterm</option>
            {INCOTERMS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Mode</label>
          <select className="input" name="mode" value={form.mode} onChange={change}>
            <option>Sea</option><option>Air</option><option>Road</option><option>Rail</option>
          </select>
        </div>
      </div>

      {/* ── Part Details ── */}
      <div className="parts-container" style={{ marginTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #333", paddingBottom: "10px" }}>
          <h4>Part Details</h4>
          <button type="button" className="btn primary" onClick={addPart}>+ Add Part</button>
        </div>

        {form.parts.map((part, index) => (
          <div
            key={index}
            style={{ border: "1px solid #eee", padding: "20px", margin: "15px 0", borderRadius: "8px", position: "relative" }}
          >
            {form.parts.length > 1 && (
              <button
                onClick={() => removePart(index)}
                style={{ position: "absolute", right: "10px", top: "10px", color: "red", border: "none", background: "none", cursor: "pointer" }}
              >
                ✖ Remove
              </button>
            )}

            {/* Row 1: Part No, Part Desc, Box Size, No. of Boxes */}
            <div className="form-grid">
              <div className="field">
                <label>Part Number</label>
                <input className="input" name="part_no" value={part.part_no} onChange={(e) => handlePartChange(index, e)} />
              </div>
              <div className="field">
                <label>Part Description</label>
                <input className="input" name="part_desc" value={part.part_desc} onChange={(e) => handlePartChange(index, e)} />
              </div>
              <div className="field">
                <label>Box Size</label>
                <input className="input" name="part_box_size" value={part.part_box_size} onChange={(e) => handlePartChange(index, e)} placeholder="e.g. 10x10x12" />
              </div>
              {/* ✅ New field — No. of Boxes per part */}
              <div className="field">
                <label>No. of Boxes</label>
                <input
                  className="input"
                  type="number"
                  name="part_no_of_boxes"
                  value={part.part_no_of_boxes}
                  onChange={(e) => handlePartChange(index, e)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Row 2: Qty, Net Wt/Unit, Total Net Wt (auto), Gross Wt (manual) */}
            <div className="form-grid" style={{ marginTop: "10px" }}>
              <div className="field">
                <label>Quantity</label>
                <input
                  className="input"
                  type="number"
                  name="part_qty"
                  value={part.part_qty}
                  onChange={(e) => handlePartChange(index, e)}
                />
              </div>
              <div className="field">
                <label>Net Wt / Unit (Kg)</label>
                <input
                  className="input"
                  type="number"
                  name="part_net_unit"
                  value={part.part_net_unit}
                  onChange={(e) => handlePartChange(index, e)}
                />
              </div>

              {/* ✅ Replaces Packing Wt — auto-calculated but editable */}
              <div className="field">
                <label>
                  Total Net Wt (Kg)
                  <span style={{ fontSize: "11px", color: "#888", marginLeft: "6px" }}>
                    (Qty × Net Wt/Unit)
                  </span>
                </label>
                <input
                  className="input"
                  type="number"
                  name="part_total_net_wt"
                  value={part.part_total_net_wt}
                  onChange={(e) => handlePartChange(index, e)}
                  style={{ background: "#f0f7ff" }}   /* light blue = auto-calc hint */
                />
              </div>

              {/* ✅ Gross Wt stays fully manual */}
              <div className="field">
                <label>Gross Wt (Kg)</label>
                <input
                  className="input"
                  type="number"
                  name="part_gross"
                  value={part.part_gross}
                  onChange={(e) => handlePartChange(index, e)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Whole Shipment Totals ── */}
      <div
        className="totals-section"
        style={{ background: "#f4f7f6", padding: "20px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "20px" }}
      >
        <h4 style={{ marginBottom: "15px" }}>Whole Shipment Totals</h4>
        <div className="form-grid">
          <div className="field">
            <label>Total Net Weight (Kg)</label>
            <input className="input" value={form.total_net_wt} readOnly style={{ fontWeight: "bold" }} />
          </div>
          <div className="field">
            <label>Total Gross Weight (Kg)</label>
            <input className="input" value={form.total_gross_wt} readOnly style={{ fontWeight: "bold" }} />
          </div>
          {/* ✅ Replaces "Total Parts Count" */}
          <div className="field">
            <label>Total No. of Boxes</label>
            <input className="input" value={form.total_no_of_boxes} readOnly style={{ fontWeight: "bold" }} />
          </div>
        </div>
      </div>

      {/* ── SB Info ── */}
      <div className="form-grid" style={{ marginTop: "20px" }}>
        <div className="field">
          <label>SB No</label>
          <input className="input" name="sb_no" value={form.sb_no} onChange={change} />
        </div>
        <div className="field">
          <label>SB Date</label>
          <input className="input" type="date" name="sb_date" value={form.sb_date} onChange={change} />
        </div>
      </div>

      <div className="actions" style={{ marginTop: "30px" }}>
        <button className="btn primary" onClick={onNext}>Save & Next</button>
      </div>
    </div>
  );
}
