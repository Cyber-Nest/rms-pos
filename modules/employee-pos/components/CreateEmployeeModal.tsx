import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, MapPin, KeyRound, Briefcase, ChevronDown, Eye, EyeOff, CheckCircle, ShieldAlert } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface EmployeeData {
  _id?: string;
  employeeId?: string;
  name: string;
  role: "manager" | "driver" | "cashier" | "chef" | "crew-member";
  phone?: string;
  email?: string;
  address?: string;
  pin?: string;
  isActive?: boolean;
}

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeToEdit?: EmployeeData | null;
}

export default function CreateEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  employeeToEdit,
}: CreateEmployeeModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<EmployeeData["role"]>("cashier");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name || "");
      setRole(employeeToEdit.role || "cashier");
      setPhone(employeeToEdit.phone || "");
      setEmail(employeeToEdit.email || "");
      setAddress(employeeToEdit.address || "");
      setPin(""); // Leave PIN blank when editing unless changing
    } else {
      setName("");
      setRole("cashier");
      setPhone("");
      setEmail("");
      setAddress("");
      setPin("");
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const getBranchId = () => {
    if (typeof window !== "undefined") {
      const rawBranch = localStorage.getItem("rms_branch");
      if (rawBranch) {
        try {
          const b = JSON.parse(rawBranch);
          return b._id || b.id;
        } catch (e) {}
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter employee name");
      return;
    }

    if (phone.trim()) {
      const phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        toast.error("Phone number must be exactly 10 digits");
        return;
      }
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!employeeToEdit && (!pin || !/^\d{4}$/.test(pin.trim()))) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }

    if (employeeToEdit && pin && !/^\d{4}$/.test(pin.trim())) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }

    const branchId = getBranchId();
    if (!branchId) {
      toast.error("Branch session invalid. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      if (employeeToEdit) {
        const payload: any = {
          branchId,
          name: name.trim(),
          role,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
        };
        if (pin.trim()) {
          payload.pin = pin.trim();
        }

        const res = await axios.patch(
          `${apiUrl}/employees/${employeeToEdit._id}`,
          payload
        );
        if (res.data.success) {
          toast.success("Employee updated successfully");
          onSuccess();
          onClose();
        }
      } else {
        const payload = {
          branchId,
          name: name.trim(),
          role,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          pin: pin.trim(),
        };

        const res = await axios.post(`${apiUrl}/employees`, payload);
        if (res.data.success) {
          toast.success(`Employee ${res.data.data.employeeId} created successfully!`);
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#18181B] text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">
              <User size={16} />
            </div>
            <div>
              <h3 className="text-sm font-900 tracking-wide text-white">
                {employeeToEdit ? "Edit Employee" : "Create New Employee"}
              </h3>
              <p className="text-[11px] text-neutral-400 font-500">
                {employeeToEdit ? `ID: ${employeeToEdit.employeeId}` : "Assign role and 4-digit PIN"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-[11px] font-800 uppercase tracking-wider text-neutral-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Smith"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-600 text-neutral-800 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1">
            <label className="block text-[11px] font-800 uppercase tracking-wider text-neutral-600">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as EmployeeData["role"])}
                className="w-full pl-9 pr-9 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-700 text-neutral-800 focus:outline-none focus:border-brand-primary focus:bg-white appearance-none transition-all cursor-pointer"
              >
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
                <option value="chef">Chef</option>
                <option value="driver">Driver</option>
                <option value="crew-member">Crew Member</option>
              </select>
              <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Phone & Email (2 Cols) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-800 uppercase tracking-wider text-neutral-600">
                Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(587) 365-5401"
                  className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-600 text-neutral-800 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
                <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-800 uppercase tracking-wider text-neutral-600">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.smith@chickendelight.com"
                  className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-600 text-neutral-800 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
                <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-1">
            <label className="block text-[11px] font-800 uppercase tracking-wider text-neutral-600">
              Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="231 Edgefield Pl, Strathmore, AB"
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-600 text-neutral-800 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          {/* 4-Digit PIN Input */}
          <div className="space-y-1 pt-1">
            <label className="block text-[11px] font-800 uppercase tracking-wider text-neutral-600">
              4-Digit Passcode / PIN {!employeeToEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder={employeeToEdit ? "Leave blank to keep unchanged" : "4-digit PIN (e.g. 1234)"}
                required={!employeeToEdit}
                className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-700 text-neutral-900 tracking-widest focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
              <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1 cursor-pointer"
                title={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 font-500">
              Used for Check-In / Check-Out verification.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-700 text-neutral-600 hover:bg-neutral-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-800 hover:bg-brand-primary/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{employeeToEdit ? "Update Employee" : "Create Employee"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
