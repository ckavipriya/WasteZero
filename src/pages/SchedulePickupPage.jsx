import { useState, useEffect, useRef } from 'react';
import {
  CalendarClock,
  PlusCircle,
  Clock,
  CheckCircle2,
  Trash2,
  MapPin,
  Scale,
  FileText,
  AlertCircle,
  Truck,
  Check,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { pickupApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'plastic', label: 'Plastics & Bottles', icon: '🧴' },
  { id: 'paper', label: 'Paper & Cardboard', icon: '📦' },
  { id: 'glass', label: 'Glass Containers', icon: '🍾' },
  { id: 'e-waste', label: 'Electronic Waste', icon: '💻' },
  { id: 'metal', label: 'Metals & Cans', icon: '🥫' },
  { id: 'organic', label: 'Organic / Compost', icon: '🍎' },
];

export default function SchedulePickupPage() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState('plastic');
  const [weightEstimateKg, setWeightEstimateKg] = useState('');
  const [address, setAddress] = useState(user?.address || user?.location || '');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]); // Base64 strings or Object URLs

  // Validation errors
  const [errors, setErrors] = useState({});

  // Camera Modal state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [targetPickupForPhoto, setTargetPickupForPhoto] = useState(null);
  const videoRef = useRef(null);

  const fetchPickups = async () => {
    try {
      const res = await pickupApi.getAll();
      if (res.data?.success) {
        setPickups(res.data.pickups || []);
      }
    } catch (err) {
      console.error('Error fetching pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
    // Default tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const isoString = tomorrow.toISOString().slice(0, 16);
    setScheduledTime(isoString);
  }, []);

  // Cleanup camera stream when component unmounts or camera closes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle live camera activation
  const startCamera = async (targetPickup = null) => {
    setTargetPickupForPhoto(targetPickup);
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Live camera access failed, falling back to file picker', err);
      toast.error('Unable to access camera directly. Please upload or select a photo.');
      setCameraActive(false);
      // Trigger file input click
      document.getElementById('photo-upload-input')?.click();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    setTargetPickupForPhoto(null);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    if (targetPickupForPhoto) {
      try {
        const updatedPhotos = [...(targetPickupForPhoto.photos || []), dataUrl];
        await pickupApi.updateStatus(targetPickupForPhoto._id, { photos: updatedPhotos });
        toast.success('Verification photo attached to pickup!');
        fetchPickups();
      } catch (err) {
        toast.error('Failed to attach verification photo');
      }
    } else {
      setPhotos((prev) => [...prev, dataUrl]);
      toast.success('Photo captured and attached!');
    }
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} photo(s) added!`);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!category) newErrors.category = 'Category is required';

    const weightNum = parseFloat(weightEstimateKg);
    if (!weightEstimateKg || isNaN(weightNum) || weightNum <= 0) {
      newErrors.weightEstimateKg = 'Please enter a valid weight in kg (e.g. 5.0)';
    }

    if (!address.trim()) {
      newErrors.address = 'Pickup address is mandatory';
    }

    if (!scheduledTime) {
      newErrors.scheduledTime = 'Scheduled pickup date/time is required';
    } else if (new Date(scheduledTime).getTime() < Date.now()) {
      newErrors.scheduledTime = 'Scheduled time must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category,
        weightEstimateKg: parseFloat(weightEstimateKg),
        address: address.trim(),
        scheduledTime: new Date(scheduledTime).toISOString(),
        notes: notes.trim(),
        photos,
      };

      const res = await pickupApi.create(payload);
      if (res.data?.success) {
        toast.success('Pickup request submitted successfully! An agent has been dispatched.');
        setWeightEstimateKg('');
        setNotes('');
        setPhotos([]);
        setErrors({});
        fetchPickups();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule pickup');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (pickupId, newStatus) => {
    try {
      await pickupApi.updateStatus(pickupId, { status: newStatus });
      toast.success(`Pickup status updated to ${newStatus}`);
      fetchPickups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancel = async (pickupId) => {
    if (!confirm('Are you sure you want to cancel this pickup request?')) return;
    try {
      await pickupApi.cancel(pickupId);
      toast.success('Pickup cancelled');
      fetchPickups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel pickup');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Pickup Request</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select waste type, specify weight, attach photos of your recyclables via camera, and request doorstep collection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-base">Schedule New Pickup</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Recyclable Waste Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                      category === cat.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.category}</p>}
            </div>

            {/* Estimated Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Weight (kg) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  placeholder="e.g. 5.0"
                  value={weightEstimateKg}
                  onChange={(e) => {
                    setWeightEstimateKg(e.target.value);
                    if (errors.weightEstimateKg) setErrors((prev) => ({ ...prev, weightEstimateKg: null }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border ${
                    errors.weightEstimateKg
                      ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  } focus:outline-none focus:ring-2`}
                />
              </div>
              {errors.weightEstimateKg && (
                <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.weightEstimateKg}</span>
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pickup Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Street address, city, zip code"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border ${
                    errors.address
                      ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  } focus:outline-none focus:ring-2`}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.address}</span>
                </p>
              )}
            </div>

            {/* Scheduled Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pickup Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => {
                  setScheduledTime(e.target.value);
                  if (errors.scheduledTime) setErrors((prev) => ({ ...prev, scheduledTime: null }));
                }}
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.scheduledTime
                    ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                } focus:outline-none focus:ring-2`}
              />
              {errors.scheduledTime && (
                <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.scheduledTime}</span>
                </p>
              )}
            </div>

            {/* Photos & Camera Capture */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Attach Waste Photos (Camera / Upload)
              </label>

              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition"
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Take Photo</span>
                </button>

                <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload Image</span>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo Thumbnails */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {photos.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={img} alt={`Waste Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-0.5 right-0.5 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pickup Instructions / Special Notes
              </label>
              <textarea
                rows={2}
                placeholder="Gate code, landmark, or bag placement instructions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner size="sm" /> : <CalendarClock className="w-4 h-4" />}
              <span>Submit Pickup Request</span>
            </button>
          </form>
        </div>

        {/* Pickups History / Status Tracker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Pickup History & Live Tracker</h2>
              <span className="text-xs text-slate-500 font-medium">{pickups.length} scheduled</span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Spinner size="md" className="text-emerald-600" />
              </div>
            ) : pickups.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No pickup requests found. Submit your first request using the form on the left!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pickups.map((item) => (
                  <div key={item._id} className="py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">
                          {CATEGORIES.find((c) => c.id === item.category)?.icon || '📦'}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-900 capitalize flex items-center gap-2">
                            <span>{item.category}</span>
                            {item.weightEstimateKg && (
                              <span className="text-xs font-normal text-slate-500">
                                ~{item.weightEstimateKg} kg
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.address}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'in-progress' || item.status === 'assigned'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.status !== 'completed' && item.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(item._id)}
                            title="Cancel Pickup"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 bg-slate-50 p-2.5 rounded-lg">
                      <div>
                        <span className="font-semibold text-slate-700">Scheduled: </span>
                        {new Date(item.scheduledTime).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {item.agent && (
                        <div>
                          <span className="font-semibold text-slate-700">Agent: </span>
                          {item.agent.name || item.agent.username}
                        </div>
                      )}
                      {item.notes && (
                        <div className="w-full text-slate-600 italic">
                          "{item.notes}"
                        </div>
                      )}
                    </div>

                    {/* Attached Photos & Verification Camera */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                          Waste Photos ({item.photos?.length || 0}):
                        </span>
                        {item.status !== 'completed' && item.status !== 'cancelled' && (
                          <button
                            onClick={() => startCamera(item)}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 transition cursor-pointer"
                          >
                            <Camera className="w-3 h-3 text-emerald-600" />
                            <span>Add Verification Snap</span>
                          </button>
                        )}
                      </div>
                      {item.photos && item.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.photos.map((photo, pIdx) => (
                            <img
                              key={pIdx}
                              src={photo}
                              alt="Attached Waste"
                              className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-xs"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Agent / Admin Simulation Actions */}
                    {(user?.role === 'agent' || user?.role === 'admin') && item.status !== 'completed' && item.status !== 'cancelled' && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-slate-600">Update status:</span>
                        {item.status === 'assigned' && (
                          <button
                            onClick={() => handleStatusChange(item._id, 'in-progress')}
                            className="text-xs px-2.5 py-1 bg-amber-600 text-white rounded font-medium hover:bg-amber-700 flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" /> Mark In Transit
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(item._id, 'completed')}
                          className="text-xs px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Mark Collected & Done
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Access Modal */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-slate-200 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Capture Waste Photo</h3>
              </div>
              <button onClick={stopCamera} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
