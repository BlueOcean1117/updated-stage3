import React, { useState } from "react";

const EMPTY_FORM = {
  customerName: "",
  customerRFQDate: "",
  itemDescription: "",
  enquiryNumberMode: "auto",
  enquiryNumber: "",
  customerPartNo: "",
  customerPartName: "",
  modifiedBOPartNo: "",
  boPartName: "",
  supplierName: "",
  poNumber: "",
  dateOfIssue: "",
};

/* ── SVG icon helpers ── */
const IconBO = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconPart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const IconPO = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconSparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z"/>
  </svg>
);

export default function CreateEnquiryModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isSubmitting,
}) {
  const isEdit = !!editData;

  const getInitialForm = () => {
    if (editData) {
      return {
        customerName: editData.customerName || "",
        customerRFQDate: editData.customerRFQDate
          ? new Date(editData.customerRFQDate).toISOString().split("T")[0]
          : "",
        itemDescription: editData.itemDescription || "",
        enquiryNumberMode: "manual",
        enquiryNumber: editData.enquiryNumber || "",
        customerPartNo: editData.partMapping?.customerPartNo || "",
        customerPartName: editData.partMapping?.customerPartName || "",
        modifiedBOPartNo: editData.partMapping?.modifiedBOPartNo || "",
        boPartName: editData.partMapping?.boPartName || "",
        supplierName: editData.poDetails?.supplierName || "",
        poNumber: editData.poDetails?.poNumber || "",
        dateOfIssue: editData.poDetails?.dateOfIssue
          ? new Date(editData.poDetails.dateOfIssue).toISOString().split("T")[0]
          : "",
      };
    }
    return { ...EMPTY_FORM };
  };

  const [activeTab, setActiveTab] = useState("bo");
  const [form, setForm] = useState(getInitialForm);

  React.useEffect(() => {
    if (isOpen) {
      setForm(getInitialForm());
      setActiveTab("bo");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      customerName: form.customerName,
      customerRFQDate: form.customerRFQDate || null,
      itemDescription: form.itemDescription,
      enquiryNumber:
        form.enquiryNumberMode === "auto" ? "auto" : form.enquiryNumber,
      partMapping: {
        customerPartNo: form.customerPartNo,
        customerPartName: form.customerPartName,
        modifiedBOPartNo: form.modifiedBOPartNo,
        boPartName: form.boPartName,
      },
      poDetails: {
        supplierName: form.supplierName,
        poNumber: form.poNumber,
        dateOfIssue: form.dateOfIssue || null,
      },
    };
    if (isEdit) payload.enquiryNumber = form.enquiryNumber;
    onSubmit(payload);
  };

  const tabs = [
    { key: "bo", label: "BO / Enquiry & Part Mapping", Icon: IconBO },
    { key: "po", label: "PO Details", Icon: IconPO },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{isEdit ? "Edit Enquiry" : "Create New Enquiry"}</h2>
          <p>
            {isEdit
              ? "Update the enquiry details below."
              : "Fill in the details below to create a new enquiry record. You can add information across all three sections."}
          </p>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <hr className="modal-divider" />

        {/* Tabs */}
        <div className="modal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`modal-tab${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="modal-tab-icon"><tab.Icon /></span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="modal-body">
          {/* ─── BO / Enquiry & Part Mapping ─── */}
          {activeTab === "bo" && (
            <>
              <div className="tab-section bo-section">
                <div className="tab-section-blob bo-blob" />
                <div className="tab-section-title">
                  <span className="section-icon bo"><IconBO /></span>
                  BO / Enquiry Details
                </div>
                <div className="tab-fields-grid">
                  <div className="tab-field-card">
                    <label className="bo-label required">Customer Name</label>
                    <input type="text" placeholder="Enter customer name" value={form.customerName} onChange={(e) => handleChange("customerName", e.target.value)} />
                  </div>
                  <div className="tab-field-card">
                    <label className="bo-label required">Customer RFQ Date</label>
                    <input type="date" placeholder="dd-mm-yyyy" value={form.customerRFQDate} onChange={(e) => handleChange("customerRFQDate", e.target.value)} />
                  </div>
                </div>
                <div className="tab-fields-grid single">
                  <div className="tab-field-card">
                    <label className="bo-label">Item Description</label>
                    <input type="text" placeholder="Enter item description" value={form.itemDescription} onChange={(e) => handleChange("itemDescription", e.target.value)} />
                  </div>
                </div>

                {/* Enquiry Number Generation */}
                {!isEdit && (
                  <div className="enquiry-gen-section">
                    <div className="enquiry-gen-title">
                      <IconSparkle /> Enquiry No. Generation
                    </div>
                    <div className="enquiry-gen-options">
                      <label className={form.enquiryNumberMode === "auto" ? "selected" : ""}>
                        <input type="radio" name="enquiryMode" checked={form.enquiryNumberMode === "auto"} onChange={() => handleChange("enquiryNumberMode", "auto")} />
                        Auto Generate
                      </label>
                      <label className={form.enquiryNumberMode === "manual" ? "selected" : ""}>
                        <input type="radio" name="enquiryMode" checked={form.enquiryNumberMode === "manual"} onChange={() => handleChange("enquiryNumberMode", "manual")} />
                        Manual Entry
                      </label>
                    </div>
                    {form.enquiryNumberMode === "auto" ? (
                      <div className="enquiry-gen-info">
                        <span className="gen-icon"><IconSparkle /></span>
                        <span>
                          Enquiry No. will be auto-generated<br />
                          <span className="gen-example">Example: ENQ-2024-001, ENQ-2024-002, etc.</span>
                        </span>
                      </div>
                    ) : (
                      <div className="enquiry-gen-input">
                        <input type="text" placeholder="Enter enquiry number (e.g. ENQ-2024-001)" value={form.enquiryNumber} onChange={(e) => handleChange("enquiryNumber", e.target.value)} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="tab-section part-section" style={{ marginTop: "16px" }}>
                <div className="tab-section-blob part-blob" />
                <div className="tab-section-title">
                  <span className="section-icon part"><IconPart /></span>
                  Part Number Mapping
                </div>
                <div className="tab-fields-grid">
                  <div className="tab-field-card">
                    <label className="part-label">Customer Part No</label>
                    <input type="text" placeholder="Enter customer part no" value={form.customerPartNo} onChange={(e) => handleChange("customerPartNo", e.target.value)} />
                  </div>
                  <div className="tab-field-card">
                    <label className="part-label">Customer Part Name</label>
                    <input type="text" placeholder="Enter customer part name" value={form.customerPartName} onChange={(e) => handleChange("customerPartName", e.target.value)} />
                  </div>
                </div>
                <div className="tab-fields-grid">
                  <div className="tab-field-card">
                    <label className="part-label">Modified BO Part No</label>
                    <input type="text" placeholder="Enter modified BO part no" value={form.modifiedBOPartNo} onChange={(e) => handleChange("modifiedBOPartNo", e.target.value)} />
                  </div>
                  <div className="tab-field-card">
                    <label className="part-label">BO Part Name</label>
                    <input type="text" placeholder="Enter BO part name" value={form.boPartName} onChange={(e) => handleChange("boPartName", e.target.value)} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── PO Details ─── */}
          {activeTab === "po" && (
            <div className="tab-section po-section">
              <div className="tab-section-blob po-blob" />
              <div className="tab-section-title">
                <span className="section-icon po"><IconPO /></span>
                PO Number Details
              </div>
              <div className="tab-fields-grid">
                <div className="tab-field-card">
                  <label className="po-label">Supplier Name</label>
                  <input type="text" placeholder="Enter supplier name" value={form.supplierName} onChange={(e) => handleChange("supplierName", e.target.value)} />
                </div>
                <div className="tab-field-card">
                  <label className="po-label">PO Number</label>
                  <input type="text" placeholder="Enter PO number" value={form.poNumber} onChange={(e) => handleChange("poNumber", e.target.value)} />
                </div>
              </div>
              <div className="tab-fields-grid single">
                <div className="tab-field-card" style={{ maxWidth: "280px" }}>
                  <label className="po-label">Date of Issue</label>
                  <input type="date" value={form.dateOfIssue} onChange={(e) => handleChange("dateOfIssue", e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
            <IconSparkle /> {isEdit ? "Update Enquiry" : "Create Enquiry"}
          </button>
        </div>
      </div>
    </div>
  );
}
