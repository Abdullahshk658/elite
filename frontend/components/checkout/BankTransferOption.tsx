const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'HBL';
const bankTitle = process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE || 'EliteKicks Official';
const accountNo = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '1234-5678901-2';

export default function BankTransferOption() {
  return (
    <div className="rounded-sharp border border-grey-light p-4">
      <h4 className="font-semibold">Bank Transfer</h4>
      <p className="mt-1 text-sm text-grey-mid">Transfer payment before dispatch and share screenshot on WhatsApp.</p>
      <div className="mt-3 space-y-1 text-sm">
        <p><span className="font-semibold">Bank:</span> {bankName}</p>
        <p><span className="font-semibold">Title:</span> {bankTitle}</p>
        <p><span className="font-semibold">Account:</span> {accountNo}</p>
      </div>
    </div>
  );
}
