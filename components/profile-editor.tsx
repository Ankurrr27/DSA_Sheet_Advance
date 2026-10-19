"use client";

import { Check, ImagePlus, LogOut, Save, Upload, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type ProfileUser = { name: string; email: string | null; image: string | null };

export default function ProfileEditor() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user: ProfileUser | null }) => {
        setUser(data.user);
        setName(data.user?.name || "");
        setImage(data.user?.image || "");
      })
      .catch(() => setError("Unable to load your profile."))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, image }) });
      const data = await response.json() as { user?: ProfileUser; error?: string };
      if (!response.ok || !data.user) throw new Error(data.error || "Unable to save changes.");
      setUser(data.user);
      setName(data.user.name);
      setImage(data.user.image || "");
      setMessage("Profile updated");
      window.dispatchEvent(new Event("dsa-profile-updated"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/practice";
  }

  async function uploadImage(file: File) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/profile/image", { method: "POST", body: form });
      const data = await response.json() as { user?: ProfileUser; error?: string };
      if (!response.ok || !data.user) throw new Error(data.error || "Unable to upload image.");
      setUser(data.user);
      setImage(data.user.image || "");
      setMessage("Image uploaded");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to upload image.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section className="profile-editor profile-editor-loading">Loading your profile…</section>;
  if (!user) return <section className="profile-editor profile-editor-login"><UserRound size={20} /><div><strong>Sign in to edit your profile</strong><span>Save your name, image, and progress.</span></div><Link href="/api/auth/google">Continue with Google</Link></section>;

  const initials = user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <section className="profile-editor" aria-labelledby="profile-editor-title">
    <div className="profile-editor-heading"><div><div className="profile-card-label">ACCOUNT SETTINGS</div><h2 id="profile-editor-title">Your profile</h2><p>Personalize how your progress appears across DSA/track.</p></div><div className="profile-avatar-upload"><div className="profile-editor-avatar">{image ? <img src={image} alt="" /> : initials}</div><label className="profile-avatar-upload-button"><Upload size={13} /> Change photo<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.currentTarget.value = ""; }} /></label></div></div>
    <form onSubmit={saveProfile} className="profile-editor-form">
      <label><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required /></label>
      <label><span>Profile image URL <em>(optional)</em></span><div className="profile-image-input"><ImagePlus size={16} /><input value={image} onChange={(event) => setImage(event.target.value)} placeholder="Or paste a public image URL" type="url" /></div><small>Upload a new image above, or paste a public image URL.</small></label>
      <div className="profile-editor-actions"><span className={error ? "profile-editor-error" : "profile-editor-success"}>{error || (message && <><Check size={13} /> {message}</>)}</span><div className="profile-editor-button-group"><button type="button" className="profile-logout-button" onClick={logout}><LogOut size={15} />Log out</button><button type="submit" disabled={saving}><Save size={15} />{saving ? "Saving…" : "Save changes"}</button></div></div>
    </form>
  </section>;
}
