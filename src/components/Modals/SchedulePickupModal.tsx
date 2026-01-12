"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface SchedulePickupModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    waybill: string;
    onSuccess?: () => void;
}

const SchedulePickupModal: React.FC<SchedulePickupModalProps> = ({
    isOpen,
    onClose,
    orderId,
    waybill,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Generate next 3 days starting from TOMORROW for the date chips
    const getNextDays = () => {
        const days = [];
        for (let i = 1; i <= 3; i++) { // Start from 1 (tomorrow)
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                full: date.toISOString().split("T")[0],
                day: date.toLocaleDateString("en-US", { weekday: "short" }),
                date: date.getDate(),
                month: date.toLocaleDateString("en-US", { month: "short" }),
            });
        }
        return days;
    };

    const dateChips = getNextDays();

    const [formData, setFormData] = useState({
        pickupLocation: "Hifi bags",
        pickupDate: dateChips[0].full,
        pickupTime: "14:00:00 - 18:00:00",
        expectedPackageCount: "1",
    });

    const [saveAsDefault, setSaveAsDefault] = useState(false);

    const handleDateSelect = (date: string) => {
        setFormData(prev => ({ ...prev, pickupDate: date }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePrint = () => {
        window.open(`/api/orders/webhook/download-label/${orderId}?view=true`, "_blank");
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(`/api/orders/webhook/download-label/${orderId}`);
            if (!response.ok) throw new Error("Failed to download");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `shipping-label-${waybill}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error: any) {
            toast.error("Download failed");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(
                `/api/orders/webhook/schedule-pickup/${orderId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        saveAsDefault
                    }),
                },
            );

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || "Pickup scheduled successfully", {
                    duration: 4000,
                    position: "top-right",
                });
                onSuccess?.();
                onClose();
            } else {
                // Show more user-friendly error if it's a balance issue
                let errorMsg = data.message || "Failed to schedule pickup";

                if (data.details?.prepaid) {
                    errorMsg = `Delhivery Balance Error: ${data.details.prepaid}`;
                } else if (data.details) {
                    // Fallback for other detailed errors
                    const detailStr = typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
                    errorMsg = `${errorMsg} (${detailStr})`;
                }

                toast.error(errorMsg, {
                    duration: 6000,
                    position: "top-right",
                });
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred", {
                duration: 4000,
                position: "top-right",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6 dark:border-gray-700">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-gray-100">
                            Add to Pickup
                        </h2>
                        <p className="text-sm text-slate-500 flex items-center mt-1">
                            Select any existing pickup request or create new request
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 dark:hover:bg-gray-700"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
                    {/* Left Side: Label Preview */}
                    <div className="lg:w-1/2 p-6 border-r dark:border-gray-700 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/10 flex flex-col">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Official Shipping Label</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-sm"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    PRINT
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-sm"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {isDownloading ? "..." : "DOWNLOAD"}
                                </button>
                            </div>
                        </div>
                        <div className="relative flex-1 rounded-xl border-2 border-dashed border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden shadow-inner min-h-[450px]">
                            <iframe
                                src={`/api/orders/webhook/download-label/${orderId}?view=true`}
                                className="h-full w-full"
                                title="Shipping Label"
                            />
                        </div>
                    </div>

                    {/* Right Side: Pickup Form */}
                    <div className="lg:w-1/2 p-6 overflow-y-auto flex flex-col bg-white dark:bg-gray-800">
                        <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                            {/* Selected Pickup Location */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 dark:text-gray-400">Selected pickup location</label>
                                <div className="flex">
                                    <span className="bg-slate-100 dark:bg-gray-700 text-slate-400 dark:text-gray-300 text-xs px-4 py-1.5 rounded-full font-medium">
                                        {formData.pickupLocation}
                                    </span>
                                </div>
                            </div>

                            {/* Pickup Date Chips */}
                            <div className="space-y-3">
                                <label className="text-[13px] font-bold text-slate-600 dark:text-gray-400">Pickup Date</label>
                                <p className="text-[12px] text-slate-500">Pickup will be attempted during the selected Pickup Slot</p>
                                <div className="flex gap-4">
                                    {dateChips.map((chip) => (
                                        <button
                                            key={chip.full}
                                            type="button"
                                            onClick={() => handleDateSelect(chip.full)}
                                            className={`flex flex-col items-center justify-center w-20 h-24 rounded-2xl border-2 transition-all ${formData.pickupDate === chip.full
                                                ? "border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm"
                                                : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                                                }`}
                                        >
                                            <span className="text-[10px] font-bold uppercase">{chip.day}</span>
                                            <span className="text-2xl font-black my-1">{chip.date}</span>
                                            <span className="text-[10px] font-bold uppercase">{chip.month}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pickup Slot Selection */}
                            <div className="bg-slate-50 dark:bg-gray-900/40 rounded-xl p-5 space-y-4 border border-slate-100 dark:border-gray-700">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Default Pickup Slot</label>
                                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm relative">
                                    <div className="bg-slate-50 dark:bg-gray-700 p-2 rounded-lg">
                                        {formData.pickupTime.startsWith("10:") ? (
                                            // Mid Day / Sun
                                            <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : formData.pickupTime.startsWith("14:") ? (
                                            // Evening / Moon
                                            <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                            </svg>
                                        ) : (
                                            // Late Evening / Star-Crescent
                                            <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646zM11 5h.01M15 8h.01" />
                                            </svg>
                                        )}
                                    </div>
                                    <select
                                        id="pickupTime"
                                        name="pickupTime"
                                        value={formData.pickupTime}
                                        onChange={handleChange}
                                        className="flex-1 bg-transparent border-none text-[14px] font-semibold text-slate-700 dark:text-white focus:ring-0 cursor-pointer appearance-none pr-8"
                                    >
                                        <option value="10:00:00 - 14:00:00">Mid Day 10:00:00 - 14:00:00</option>
                                        <option value="14:00:00 - 18:00:00">Evening 14:00:00 - 18:00:00</option>
                                        <option value="18:00:00 - 21:00:00">Late Evening 18:00:00 - 21:00:00</option>
                                    </select>
                                    <div className="absolute right-4 pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="saveDefault"
                                        checked={saveAsDefault}
                                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    <label htmlFor="saveDefault" className="text-[12px] font-medium text-slate-600 dark:text-gray-400">Save this as the default pickup slot for this location</label>
                                </div>
                            </div>

                            <p className="text-[11px] font-bold text-red-500">
                                For Next Day Delivery shipments, please ensure pickup is scheduled before 6:00 PM
                            </p>

                            {/* Guidelines Link Area */}
                            <div className="bg-slate-50 dark:bg-gray-900/40 rounded-xl p-4 flex items-start gap-3 border border-slate-100 dark:border-gray-700">
                                <div className="mt-0.5">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-[12px]">
                                    <span className="font-bold text-slate-700 dark:text-gray-200">Keep the shipment ready with the label pasted.</span>
                                    <br />
                                    <a href="#" className="font-bold text-blue-600 hover:underline">Shipping Guidelines</a>
                                </div>
                            </div>
                        </form>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t mt-6 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="rounded-lg border-2 border-slate-200 bg-white px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                                Add Later
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={`rounded-lg px-8 py-2.5 text-sm font-bold text-white transition-all ${isLoading
                                    ? "cursor-not-allowed bg-slate-400"
                                    : "bg-slate-900 hover:bg-black"
                                    } shadow-md`}
                            >
                                {isLoading ? "Scheduling..." : "Add to Pickup"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulePickupModal;
