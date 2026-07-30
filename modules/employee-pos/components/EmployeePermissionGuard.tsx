"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import toast from "react-hot-toast";

interface EmployeePermissionGuardProps {
  permissionKey: string;
  children: React.ReactNode;
}

export default function EmployeePermissionGuard({
  permissionKey,
  children,
}: EmployeePermissionGuardProps) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [employeeName, setEmployeeName] = useState<string>("");

  useEffect(() => {
    const checkPermission = () => {
      if (typeof window === "undefined") return;

      try {
        const raw = localStorage.getItem("rms_active_employee");
        if (!raw) {
          // No staff logged in → Manager Terminal Mode → Always allowed
          setIsAllowed(true);
          return;
        }

        const emp = JSON.parse(raw);
        if (!emp || emp.role === "manager") {
          // Manager role → Always allowed
          setIsAllowed(true);
          return;
        }

        setEmployeeName(emp.name || "Staff");

        // Check permission key
        const perms = emp.permissions || {};

        // POS route is default allowed
        if (permissionKey === "pos") {
          setIsAllowed(perms.pos !== false);
          return;
        }

        // Check specific permission key
        let allowed = perms[permissionKey] === true;

        // If on orders page, also check URL tab parameter if present
        if (
          permissionKey === "orders" &&
          allowed &&
          typeof window !== "undefined"
        ) {
          const urlParams = new URLSearchParams(window.location.search);
          const tab = urlParams.get("tab") || urlParams.get("view");
          if (tab && tab !== "orders" && tab !== "transactions") {
            if (perms[tab] === false) {
              allowed = false;
            }
          }
        }

        if (!allowed) {
          setIsAllowed(false);
          toast.error(
            `Access Restricted: You don't have permission to view this section.`,
          );
        } else {
          setIsAllowed(true);
        }
      } catch {
        setIsAllowed(true);
      }
    };

    checkPermission();
    window.addEventListener("rms_active_employee_changed", checkPermission);
    window.addEventListener("storage", checkPermission);
    return () => {
      window.removeEventListener(
        "rms_active_employee_changed",
        checkPermission,
      );
      window.removeEventListener("storage", checkPermission);
    };
  }, [permissionKey]);

  // Loading spinner while checking
  if (isAllowed === null) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-neutral-500 font-600 text-xs">
          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span>Verifying access permissions...</span>
        </div>
      </div>
    );
  }

  // Access Denied Screen
  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-neutral-800/90 border border-neutral-700/80 rounded-2xl p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 mx-auto shadow-inner">
            <Lock size={32} />
          </div>

          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-800 bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest">
              403 Forbidden
            </span>
            <h2 className="text-xl font-900 text-white tracking-tight pt-1">
              Access Restricted
            </h2>
            <p className="text-xs text-neutral-400 font-500 leading-relaxed max-w-xs mx-auto">
              Hi <strong className="text-neutral-200">{employeeName}</strong>,
              your account does not have permission to access the{" "}
              <strong className="text-brand-primary capitalize">
                {permissionKey.replace("_", " ")}
              </strong>{" "}
              section.
            </p>
          </div>

          {/* <div className="bg-neutral-900/60 border border-neutral-700/50 rounded-xl p-3 text-[11px] text-neutral-400 font-500">
            Please contact your manager if you require access to this feature.
          </div> */}

          <div className="pt-2">
            <button
              onClick={() => {
                window.location.href = "/employee/pos";
              }}
              className="w-full py-3 bg-brand-primary hover:bg-orange-600 text-white text-xs font-800 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Return to POS Terminal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
