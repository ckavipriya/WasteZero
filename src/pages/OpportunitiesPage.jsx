import { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Calendar,
  MapPin,
  Clock,
  Users,
  PlusCircle,
  Tag,
  CheckCircle2,
  X,
} from 'lucide-react';
import { opportunityApi, applicationApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDuration, setNewDuration] = useState('3 hours');
  const [newSkills, setNewSkills] = useState('teamwork, physical stamina');
  const [newSpots, setNewSpots] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  const fetchOpportunities = async () => {
    try {
      const res = await opportunityApi.getAll({ search });
      if (res.data?.success) {
        setOpportunities(res.data.opportunities || []);
      }
    } catch (err) {
      console.error('Error fetching opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search]);

  const handleApply = async (oppId) => {
    try {
      const res = await applicationApi.apply({
        opportunityId: oppId,
        message: 'Excited to volunteer and support this zero-waste initiative!',
      });
      if (res.data?.success) {
        toast.success('Application submitted successfully!');
        setAppliedIds((prev) => new Set([...prev, oppId]));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: newTitle.trim(),
        description: newDesc.trim(),
        location: newLoc.trim(),
        date: new Date(newDate).toISOString(),
        duration: newDuration,
        requiredSkills: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
        spotsAvailable: Number(newSpots) || 15,
      };
      const res = await opportunityApi.create(payload);
      if (res.data?.success) {
        toast.success('Opportunity created and published!');
        setShowModal(false);
        fetchOpportunities();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community Drives & Volunteering</h1>
          <p className="text-sm text-slate-500 mt-1">
            Join environmental restoration cleanups, plastic segregation drives, and recycling workshops hosted by NGOs.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {(user?.role === 'ngo' || user?.role === 'admin') && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host Drive</span>
            </button>
          )}
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" className="text-emerald-600" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
          No cleanup drives matching "{search}" were found. Try another search keyword.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {opp.status || 'open'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">{opp.title}</h3>
                  </div>
                  {opp.ngo?.name && (
                    <span className="text-[11px] font-medium text-slate-400 shrink-0">
                      by {opp.ngo.name}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>

                <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {new Date(opp.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{opp.duration || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate">{opp.location}</span>
                  </div>
                </div>

                {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {opp.requiredSkills.map((sk) => (
                      <span key={sk} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  {opp.spotsAvailable || 15} spots
                </span>

                <button
                  onClick={() => handleApply(opp._id)}
                  disabled={appliedIds.has(opp._id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 ${
                    appliedIds.has(opp._id)
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {appliedIds.has(opp._id) ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <span>Volunteer</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Host Drive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">Host a New Drive or Event</h2>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harbor Shoreline Cleanup"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details about meeting point, safety gloves, goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="City / Venue"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 hours"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Spots Available</label>
                  <input
                    type="number"
                    min="1"
                    value={newSpots}
                    onChange={(e) => setNewSpots(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="teamwork, physical stamina, sorting"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow"
                >
                  {submitting ? <Spinner size="sm" /> : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
