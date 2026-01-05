"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function TestCreditsPage() {
  const searchParams = useSearchParams();
  const [companyId, setCompanyId] = useState("test_company_123");
  const [tokens, setTokens] = useState(300);
  const [amount, setAmount] = useState(50); // in RM
  const [currency, setCurrency] = useState("myr");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Check for success/cancel messages from URL
  useEffect(() => {
    const creditsSuccess = searchParams.get("credits_success");
    const creditsCanceled = searchParams.get("credits_canceled");

    if (creditsSuccess === "true") {
      setStatus("✅ Payment successful! Credits have been added to your account. Check balance below.");
    } else if (creditsCanceled === "true") {
      setStatus("⚠️ Payment was canceled. No charges were made.");
    }
  }, [searchParams]);

  const handlePurchase = async () => {
    setLoading(true);
    setStatus("Creating checkout session...");

    try {
      const response = await fetch("/api/stripe/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          tokens,
          amount: amount * 100, // Convert to cents
          currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      if (data.url) {
        setStatus("Redirecting to Stripe...");
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const checkBalance = async () => {
    try {
      const response = await fetch(`/api/credits/balance?companyId=${companyId}`);
      const data = await response.json();
      setStatus(`Current balance: ${data.balance} credits`);
    } catch (error: any) {
      setStatus(`Error checking balance: ${error.message}`);
    }
  };

  const checkLedger = async () => {
    try {
      const response = await fetch(`/api/credits/ledger?companyId=${companyId}&limit=10`);
      const data = await response.json();
      console.log("Ledger:", data.ledger);
      setStatus(`Found ${data.ledger.length} transactions (check console)`);
    } catch (error: any) {
      setStatus(`Error checking ledger: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Test Credit Purchase System</h1>
          <p className="text-gray-600 mb-8">
            Test the new Neon DB Stripe credit system with improved transaction safety
          </p>

          {/* Status Display */}
          {status && (
            <div className={`mb-6 p-4 rounded-lg ${
              status.includes("Error") 
                ? "bg-red-50 text-red-700 border border-red-200" 
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {status}
            </div>
          )}

          {/* Purchase Form */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company ID
              </label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="test_company_123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tokens
                </label>
                <input
                  type="number"
                  value={tokens}
                  onChange={(e) => setTokens(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (RM)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="myr">MYR (Malaysian Ringgit)</option>
                <option value="usd">USD (US Dollar)</option>
                <option value="sgd">SGD (Singapore Dollar)</option>
              </select>
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !companyId || tokens <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? "Processing..." : `Buy ${tokens} Credits for ${currency.toUpperCase()} ${amount.toFixed(2)}`}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={checkBalance}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Check Balance
              </button>
              <button
                onClick={checkLedger}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Check Ledger
              </button>
            </div>
          </div>

          {/* Test Card Info */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Test Card Information</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p><strong>Card Number:</strong> 4242 4242 4242 4242</p>
              <p><strong>Expiry:</strong> Any future date (e.g., 12/34)</p>
              <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
              <p><strong>ZIP:</strong> Any 5 digits (e.g., 12345)</p>
            </div>
          </div>

          {/* System Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <h3 className="font-semibold text-gray-900 mb-2">System Features</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>✅ PostgreSQL ACID transactions</li>
              <li>✅ Idempotency checks (no duplicate credits)</li>
              <li>✅ Row-level locking (no race conditions)</li>
              <li>✅ Automatic rollback on errors</li>
              <li>✅ Dual webhook events for redundancy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
