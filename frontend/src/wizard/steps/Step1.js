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
        part_pkg_wt: 0, 
        part_box_size: "" 
      }
    ],
    // Calculated Totals
    total_net_wt: 0,
    total_gross_wt: 0,
    total_pkg_wt: 0,
    ...initial,
  });
// Add this inside your Step1 component, before the existing useEffect
useEffect(() => {
  // Only fetch if enquiry_no is empty (means we are in Create mode, not Edit mode)
  if (!form.enquiry_no) {
    const fetchNextNumber = async () => {
      try {
        const response = await API.get("/shipment/enquiry-number");
        if (response.data && response.data.enquiryNo) {
          setForm(prev => ({ ...prev, enquiry_no: response.data.enquiryNo }));
        }
      } catch (err) {
        console.error("Failed to fetch enquiry number:", err);
      }
    };
    fetchNextNumber();
  }
}, []); // Empty dependency array means this runs once on mount
  /* ============================
      TOTALS CALCULATION LOGIC
  ============================ */
  useEffect(() => {
    let aggregateNet = 0;
    let aggregateGross = 0;
    let aggregatePkg = 0;
    let aggregateQty = 0;

    form.parts.forEach((p) => {
      aggregateNet += (Number(p.part_qty || 0) * Number(p.part_net_unit || 0));
      aggregateGross += Number(p.part_gross || 0);
      aggregatePkg += Number(p.part_pkg_wt || 0);
      aggregateQty += Number(p.part_qty || 0);
    });

    const updatedForm = {
      ...form,
      total_qty: aggregateQty,            // ← total parts count for backend
      total_net_wt: aggregateNet.toFixed(2),
      total_gross_wt: aggregateGross.toFixed(2),
      total_pkg_wt: aggregatePkg.toFixed(2),
    };

    setForm(updatedForm);
    onUpdate(updatedForm);
  }, [form.parts]);

  /* ======================
      HANDLERS
  ====================== */
  const handlePartChange = (index, e) => {
    const { name, value } = e.target;
    const updatedParts = [...form.parts];
    updatedParts[index][name] = value;
    setForm((prev) => ({ ...prev, parts: updatedParts }));
  };

  const addPart = () => {
    setForm(prev => ({
      ...prev,
      parts: [...prev.parts, { part_no: "", part_desc: "", part_qty: 0, part_net_unit: 0, part_gross: 0, part_pkg_wt: 0, part_box_size: "" }]
    }));
  };

  const removePart = (index) => {
    const updatedParts = form.parts.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, parts: updatedParts }));
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="step-form">
      <h3 className="step-title">Step 1 — Shipment Details</h3>

      {/* COMMON FIELDS SECTION */}
      <div className="form-grid">
        <div className="field">
          <label>Enquiry No</label>
          <input className="input" value={form.enquiry_no} readOnly />
        </div>
        <div className="field">
          <label>Supplier Name</label>
          <input className="input" name="supplier_name" value={form.supplier_name} onChange={change} />
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

      {/* DYNAMIC PARTS SECTION */}
      <div className="parts-container" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          <h4>Part Details</h4>
          <button type="button" className="btn primary" onClick={addPart}>+ Add Part</button>
        </div>

        {form.parts.map((part, index) => (
          <div key={index} style={{ border: '1px solid #eee', padding: '20px', margin: '15px 0', borderRadius: '8px', position: 'relative' }}>
             {form.parts.length > 1 && (
              <button onClick={() => removePart(index)} style={{ position: 'absolute', right: '10px', top: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✖ Remove</button>
            )}
            
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
            </div>

            <div className="form-grid" style={{ marginTop: '10px' }}>
              <div className="field">
                <label>Quantity</label>
                <input className="input" type="number" name="part_qty" value={part.part_qty} onChange={(e) => handlePartChange(index, e)} />
              </div>
              <div className="field">
                <label>Net Wt / Unit (Kg)</label>
                <input className="input" type="number" name="part_net_unit" value={part.part_net_unit} onChange={(e) => handlePartChange(index, e)} />
              </div>
              <div className="field">
                <label>Packing Wt (Kg)</label>
                <input className="input" type="number" name="part_pkg_wt" value={part.part_pkg_wt} onChange={(e) => handlePartChange(index, e)} />
              </div>
              <div className="field">
                <label>Gross Wt (Kg)</label>
                <input className="input" type="number" name="part_gross" value={part.part_gross} onChange={(e) => handlePartChange(index, e)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TOTALS SUMMARY SECTION */}
      <div className="totals-section" style={{ background: '#f4f7f6', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h4 style={{ marginBottom: '15px' }}>Whole Shipment Totals</h4>
        <div className="form-grid">
          <div className="field">
            <label>Total Net Weight</label>
            <input className="input" value={form.total_net_wt} readOnly style={{ fontWeight: 'bold' }} />
          </div>
          <div className="field">
            <label>Total Packing Weight</label>
            <input className="input" value={form.total_pkg_wt} readOnly style={{ fontWeight: 'bold' }} />
          </div>
          <div className="field">
            <label>Total Gross Weight</label>
            <input className="input" value={form.total_gross_wt} readOnly style={{ fontWeight: 'bold' }} />
          </div>
          <div className="field">
            <label>Total Parts Count</label>
            <input className="input" value={form.parts.length} readOnly />
          </div>
        </div>
      </div>

      {/* COMMON SB INFO */}
      <div className="form-grid" style={{ marginTop: '20px' }}>
        <div className="field">
          <label>SB No</label>
          <input className="input" name="sb_no" value={form.sb_no} onChange={change} />
        </div>
        <div className="field">
          <label>SB Date</label>
          <input className="input" type="date" name="sb_date" value={form.sb_date} onChange={change} />
        </div>
      </div>

      <div className="actions" style={{ marginTop: '30px' }}>
        <button className="btn primary" onClick={onNext}>Save & Next</button>
      </div>
    </div>
  );
}