// File: ../Auth/PasswordChange.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "aws-amplify/auth";
import React, { useCallback, useId, useMemo, useState, useEffect } from "react";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import CustomToast from "../TaskManager_V2/Alerts/Custom-toast";

export function PasswordChange({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const id = useId();
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [isVisible, setIsVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Reset state when dialog closes
	useEffect(() => {
		if (!open) {
			setOldPassword("");
			setNewPassword("");
			setIsVisible(false);
			setIsSubmitting(false);
			setError(null);
			setSuccessMessage(null);
		}
	}, [open]);

	const toggleVisibility = useCallback(() => setIsVisible((prev) => !prev), []);

	const checkStrength = (pass: string) => {
		const requirements = [
			{ regex: /.{8,}/, text: "At least 8 characters" },
			{ regex: /[0-9]/, text: "At least 1 number" },
			{ regex: /[a-z]/, text: "At least 1 lowercase letter" },
			{ regex: /[A-Z]/, text: "At least 1 uppercase letter" },
		];
		return requirements.map((req) => ({
			met: req.regex.test(pass),
			text: req.text,
		}));
	};

	const strength = checkStrength(newPassword);

	const strengthScore = useMemo(() => {
		return strength.filter((req) => req.met).length;
	}, [strength]);

	const getStrengthColor = (score: number) => {
		if (score === 0) return "bg-border";
		if (score <= 1) return "bg-red-500";
		if (score <= 2) return "bg-orange-500";
		if (score === 3) return "bg-amber-500";
		return "bg-emerald-500";
	};

	const getStrengthText = (score: number) => {
		if (score === 0) return "Enter a password";
		if (score <= 2) return "Weak password";
		if (score === 3) return "Medium password";
		return "Strong password";
	};

	const handleChangePassword = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();
		setIsSubmitting(true);
		setError(null);
		setSuccessMessage(null);

		if (strengthScore < 4) {
			setError("New password does not meet all strength requirements.");
			setIsSubmitting(false);
			return;
		}
		if (newPassword === oldPassword) {
			setError("New password cannot be the same as the old password.");
			setIsSubmitting(false);
			return;
		}

		try {
			await updatePassword({
				oldPassword: oldPassword,
				newPassword: newPassword,
			});
			setSuccessMessage("Password changed successfully!");
			CustomToast({
				variant: "success",
				description: "Password changed successfully!",
				duration: 3000,
			});
			setTimeout(() => {
				onOpenChange(false);
			}, 1500);
		} catch (err: any) {
			console.error("Password change error:", err);
			const errorMessage =
				err.message || "Failed to change password. Please try again.";
			setError(errorMessage);
			CustomToast({
				variant: "error",
				description: errorMessage,
				duration: 5000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const unmetRequirements = strength.filter((req) => !req.met);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Change your Password</DialogTitle>
					<DialogDescription>
						Enter your old password and set a new strong password.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleChangePassword} id="passwordChangeForm">
					<div className="grid gap-4 py-4">
						{/* Old Password Field */}
						<div className="grid gap-2">
							{" "}
							{/* Uses simple grid for vertical stacking */}
							<Label htmlFor="oldPasswordDlg">Old Password</Label>
							<Input
								id="oldPasswordDlg"
								type="password"
								value={oldPassword}
								onChange={(e) => setOldPassword(e.target.value)}
								required
								disabled={isSubmitting}
							/>
						</div>

						{/* New Password Field and its associated strength indicator */}
						<div className="grid gap-2">
							{" "}
							{/* Uses simple grid for vertical stacking */}
							<Label htmlFor={id}>New Password</Label>
							<div className="relative">
								<Input
									id={id}
									className="pe-9 w-full"
									placeholder="New Password"
									type={isVisible ? "text" : "password"}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									aria-describedby={`${id}-description`}
									required
									disabled={isSubmitting}
								/>
								<button
									className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
									type="button"
									onClick={toggleVisibility}
									aria-label={isVisible ? "Hide password" : "Show password"}
									aria-pressed={isVisible}
									aria-controls={id}
									disabled={isSubmitting}
								>
									{isVisible ? (
										<EyeOffIcon size={16} aria-hidden="true" />
									) : (
										<EyeIcon size={16} aria-hidden="true" />
									)}
								</button>
							</div>
							{/* Password Strength Indicator - moved inside the New Password's grid item */}
							{newPassword.length > 0 && (
								<div className="mt-3">
									{" "}
									{/* Added margin-top for spacing */}
									<div
										className="bg-border mb-2 h-1 w-full overflow-hidden rounded-full"
										role="progressbar"
										aria-valuenow={strengthScore}
										aria-valuemin={0}
										aria-valuemax={4}
										aria-label="Password strength"
									>
										<div
											className={`h-full ${getStrengthColor(
												strengthScore
											)} transition-all duration-500 ease-out`}
											style={{ width: `${(strengthScore / 4) * 100}%` }}
										></div>
									</div>
									{unmetRequirements.length > 0 ? (
										<>
											<p
												id={`${id}-description`}
												className="text-foreground mb-2 text-sm font-medium"
											>
												{getStrengthText(strengthScore)}. Must contain:
											</p>
											<ul
												className="space-y-1.5"
												aria-label="Password requirements"
											>
												{unmetRequirements.map((req, index) => (
													<li key={index} className="flex items-center gap-2">
														<XIcon
															size={16}
															className="text-muted-foreground/80"
															aria-hidden="true"
														/>
														<span className="text-xs text-muted-foreground">
															{req.text}
															<span className="sr-only">
																{" "}
																- Requirement not met
															</span>
														</span>
													</li>
												))}
											</ul>
										</>
									) : (
										// Display success message when all requirements are met and newPassword has content
										newPassword.length > 0 && (
											<p className="text-emerald-600 text-sm font-medium mt-2">
												All password requirements met!
											</p>
										)
									)}
								</div>
							)}
						</div>

						{/* Error and Success Messages */}
						{error && (
							<div className="col-span-full text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded">
								{error}
							</div>
						)}
						{successMessage && (
							<div className="col-span-full text-green-600 text-sm p-2 bg-green-50 border border-green-200 rounded">
								{successMessage}
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							type="submit"
							form="passwordChangeForm"
							disabled={
								isSubmitting ||
								(newPassword.length > 0 && strengthScore < 4) ||
								!oldPassword ||
								!newPassword
							}
						>
							{isSubmitting ? "Changing..." : "Change Password"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
