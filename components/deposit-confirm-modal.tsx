"use client"

export function DepositConfirmModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="deposit-confirm-card"
        style={{
          minWidth: "380px",
          width: "auto",
          height: "auto",
          maxHeight: "70%",
          padding: "20px",
          minHeight: "200px",
          borderRadius: "10px",
          backgroundColor: "#12191f",
          maxWidth: "600px",
          zIndex: 1,
          boxShadow: "inset 0px 0px 0px 1px rgba(255, 255, 255, 0.3)",
          overflow: "hidden",
          transition: "width 0.3s ease-in-out, height 0.3s ease-in-out",
          animation: "modalSlideIn 0.3s ease-out",
        }}
      >
        <style>{`
          @keyframes modalSlideIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
          .deposit-confirm-card {
            position: relative;
          }
          .deposit-confirm-card::before {
            content: "";
            position: absolute;
            inset: 0;
            opacity: 0.2;
            z-index: -1;
            pointer-events: none;
            border-radius: 10px;
            background: linear-gradient(140deg, #00d4b4 5%, #12191f 65%);
          }
        `}</style>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold" style={{ fontSize: "16px" }}>{"Para Yat\u0131rmay\u0131 Onayla"}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white leading-none w-8 h-8 flex items-center justify-center"
            style={{ fontSize: "20px" }}
          >
            &times;
          </button>
        </div>

        <p className="text-gray-400 mb-5" style={{ fontSize: "13px" }}>{"Hesab\u0131n\u0131za yat\u0131r\u0131yorsunuz"}</p>

        <div className="flex items-stretch gap-3">
          <button
            onClick={onClose}
            className="flex-1 font-semibold rounded-xl border border-[#00d4b4] text-white hover:bg-[#00d4b4]/10 transition-colors"
            style={{ minHeight: "52px", fontSize: "12px" }}
          >
            {"Hay\u0131r, iptal et"}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 font-semibold rounded-xl text-black transition-opacity hover:opacity-90 leading-snug px-3"
            style={{ backgroundColor: "#00d4b4", minHeight: "52px", fontSize: "11px" }}
          >
            PARA YATIRMAYI ONAYLA
          </button>
        </div>
      </div>
    </div>
  )
}
