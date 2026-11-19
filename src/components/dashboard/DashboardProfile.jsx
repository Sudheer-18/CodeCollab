export default function DashboardProfile({ page }) {
  return <section className="profile-section">
    <div className="profile-heading">
      <div className="profile-avatar">{(page.user?.fullName || "U").charAt(0).toUpperCase()}</div>
      <div><p className="section-kicker">Your account</p><h2>{page.user?.fullName || "User"}</h2>
        <p>{page.user?.email || "No email available"}</p></div>
    </div>
    <div className="profile-actions">
      {page.editingProfile ? <form className="profile-form" onSubmit={page.saveProfile}>
        <input value={page.profileName} onChange={(event) => page.setProfileName(event.target.value)}
          aria-label="Full name" placeholder="Full name" maxLength="80" />
        <button className="btn-primary" type="submit" disabled={page.profileLoading}>{page.profileLoading ? "Saving..." : "Save name"}</button>
        <button className="btn-secondary" type="button" onClick={() => page.setEditingProfile(false)}>Cancel</button>
      </form> : <button className="btn-secondary" onClick={() => page.setEditingProfile(true)}>Edit profile</button>}
      {page.profileMessage && <span className="profile-message" role="status">{page.profileMessage}</span>}
    </div>
  </section>;
}
