import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  sendCustomerOtp,
  verifyCustomerOtp,
  saveCustomerSession,
} from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onLoggedIn: (phone: string) => void;
}

export const LoginDialog = ({ open, onOpenChange, onLoggedIn }: Props) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("phone");
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setSeconds(30);
      setRequestId(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (step !== "otp") return;

    setSeconds(30);

    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step, requestId]);

  const handleSendOtp = async () => {
    try {
      if (phone.length !== 10) {
        toast.error("Enter a valid 10-digit mobile number");
        return;
      }

      setLoading(true);

      const response = await sendCustomerOtp(phone, "household");

      setRequestId(response.request_id);
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);

      toast.success("OTP sent", {
        description: `Use ${response.dummy_otp || "123456"} for demo login`,
      });

      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    } catch (error) {
      toast.error("Failed to send OTP", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const code = otp.join("");

      if (code.length !== 6) {
        toast.error("Enter the 6-digit OTP");
        return;
      }

      setLoading(true);

      const response = await verifyCustomerOtp({
        mobile: phone,
        otp: code,
        customer_type: "household",
      });

      saveCustomerSession(response);
window.dispatchEvent(new Event("customer-auth-changed"));
      onLoggedIn(response.user.mobile || phone);
      onOpenChange(false);

      toast.success("Welcome to HydraMight", {
        description: "You are signed in.",
      });
    } catch (error) {
      toast.error("OTP verification failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const setOtpAt = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handlePasteOtp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);

    if (!digits) return;

    const next = ["", "", "", "", "", ""];
    digits.split("").forEach((digit, index) => {
      next[index] = digit;
    });

    setOtp(next);

    const nextIndex = Math.min(digits.length, 5);
    document.getElementById(`otp-${nextIndex}`)?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-md border-gold/20 rounded-3xl">
        <div className="relative bg-gradient-hero text-primary-foreground p-7 pb-10">
          <div className="absolute -top-16 -right-16 size-48 rounded-full border border-gold/20" />
          <div className="absolute -top-10 -right-10 size-32 rounded-full border border-gold/10" />

          <div className="relative">
            <h2 className="font-display text-3xl mb-1">
              {step === "phone" ? "Welcome to HydraMight" : "Verify it's you"}
            </h2>

            <p className="text-sm text-primary-foreground/70">
              {step === "phone"
                ? "Sign in with your mobile to unlock faster checkout."
                : `Enter the 6-digit code for +91 ${phone}`}
            </p>
          </div>
        </div>

        <div className="p-7 pt-6 bg-background">
          {step === "phone" ? (
            <>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Mobile number
              </label>

              <div className="mt-2 flex items-center rounded-xl border border-input bg-secondary/40 focus-within:border-primary/40 focus-within:bg-background transition-colors overflow-hidden">
                <span className="px-4 py-3 text-sm font-medium border-r border-input bg-background/50">
                  +91
                </span>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendOtp();
                  }}
                  className="flex-1 bg-transparent px-4 py-3 outline-none text-base tracking-wide"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full mt-5 h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2"
              >
                {loading ? "Sending..." : "Send OTP"}
                <ArrowRight className="size-4" />
              </Button>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-gold" />
                Your number stays private. No spam, ever.
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => setOtpAt(index, e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      handlePasteOtp(e.clipboardData.getData("text"));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      }

                      if (e.key === "Enter") {
                        handleVerifyOtp();
                      }
                    }}
                    className="size-12 rounded-xl border border-input bg-secondary/40 text-center font-display text-xl outline-none focus:border-primary focus:bg-background transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full mt-5 h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2"
              >
                {loading ? "Verifying..." : "Verify & continue"}
                <ArrowRight className="size-4" />
              </Button>

              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="hover:text-primary"
                >
                  Change number
                </button>

                {seconds > 0 ? (
                  <span>Resend in {seconds}s</span>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}

          <p className="text-[10px] text-center text-muted-foreground mt-6 uppercase tracking-widest">
            By continuing you agree to our Terms & Privacy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};