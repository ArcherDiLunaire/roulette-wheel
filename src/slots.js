
export class Slots {
    constructor() {
        // --- Add these properties in your constructor (or set defaults there) ---
        this.slotCount = 12;                 // number of slots on your wheel
        this.weights = new Array(this.slotCount).fill(1); // default equal weights
        this.slotCaps = new Array(this.slotCount).fill(null); // per-slot cap (null = no cap)
        this._storageKey = 'wheel_selection_history_v1';
        this._history = this._loadHistory(); // loads map of slot -> [timestamps]
        this._pruneIntervalMs = 1000 * 60 * 5; // optional prune every 5 minutes
        this._lastPrune = 0;
    }

    setCount(count) {
        this.slotCount = count;
    }

    // --- Utility: angle for a slot's center (equal slices) ---
    getAngleForSlot(slotIndex) {
        const slice = 360 / this.slotCount;
        // center of the slice
        let angle = slotIndex * slice + slice;
        // normalize to 0..360
        angle = ((angle % 360) + 360) % 360 - (360 / this.slotCount);
        return angle;
    }

    // --- History persistence (localStorage) ---
    _loadHistory() {
        try {
            const raw = localStorage.getItem(this._storageKey);
            if (!raw) return Array.from({ length: this.slotCount }, () => []);
            const parsed = JSON.parse(raw);
            // ensure shape
            const out = Array.from({ length: this.slotCount }, (_, i) => (parsed[i] || []));
            return out;
        } catch (e) {
            console.warn('Failed to load wheel history', e);
            return Array.from({ length: this.slotCount }, () => []);
        }
    }
    _saveHistory() {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify(this._history));
        } catch (e) {
            console.warn('Failed to save wheel history', e);
        }
    }
    _pruneOldEntries() {
        const now = Date.now();
        // do cheap throttle to avoid too-frequent pruning
        if (now - this._lastPrune < this._pruneIntervalMs) return;
        this._lastPrune = now;

        const cutoff = now - 48 * 60 * 60 * 1000; // 48h
        for (let i = 0; i < this.slotCount; i++) {
            const arr = this._history[i];
            // keep only timestamps >= cutoff
            if (!arr || arr.length === 0) continue;
            let j = 0;
            while (j < arr.length && arr[j] < cutoff) j++;
            if (j > 0) {
                this._history[i] = arr.slice(j);
            }
        }
        this._saveHistory();
    }

    // --- Public API: set weights & caps ---
    setWeights(weightsArray) {
        if (!Array.isArray(weightsArray) || weightsArray.length !== this.slotCount)
            throw new Error('setWeights requires an array of length slotCount');
        this.weights = weightsArray.map(w => Math.max(0, Number(w) || 0));
    }

    setSlotCap(slotIndex, maxPer24h) {
        if (slotIndex < 0 || slotIndex >= this.slotCount) throw new Error('invalid slotIndex');
        if (maxPer24h == null) this.slotCaps[slotIndex] = null;
        else this.slotCaps[slotIndex] = Math.max(0, Math.floor(maxPer24h));
    }

    _getAllCounts() {
        this._pruneOldEntries();
        return this._history.map(arr => arr.length);
    }

    // --- Record a selection (call after you decide the slot) ---
    recordSelection(slotIndex) {
        const now = Date.now();
        if (!this._history[slotIndex]) this._history[slotIndex] = [];
        // keep list sorted ascending (we always push, so push is fine)
        this._history[slotIndex].push(now);
        this._pruneOldEntries();
        this._saveHistory();
    }

    // --- Weighted sampling honoring caps ---
    _chooseWeightedSlot() {
        // prune first
        this._pruneOldEntries();

        // build list of available slots (not at cap)
        const available = [];
        for (let i = 0; i < this.slotCount; i++) {
            const cap = this.slotCaps[i];
            const count = this._history[i] ? this._history[i].length : 0;
            if (cap == null || count < cap) {
                // allowed
                if (this.weights[i] > 0) available.push(i);
            }
        }

        console.log('Available slots (not at cap):', available);

        // if nothing available because of caps (or weights 0), fallback to slots that have weight>0 ignoring caps
        let candidateSlots = available;
        if (candidateSlots.length === 0) {
            candidateSlots = [];
            for (let i = 0; i < this.slotCount; i++) {
                if (this.weights[i] > 0) candidateSlots.push(i);
            }
            // if still empty (all weights 0), fallback to all slots
            if (candidateSlots.length === 0) {
                candidateSlots = Array.from({ length: this.slotCount }, (_, i) => i);
            }
        }

        // build cumulative weights
        const cum = [];
        let total = 0;
        for (const i of candidateSlots) {
            total += this.weights[i];
            cum.push(total);
        }
        const rnd = Math.random() * total;
        // find chosen slot
        let idx = 0;
        while (rnd > cum[idx]) idx++;
        return candidateSlots[idx];
    }

    // --- Convenience: choose slot, record it, set target angle, and return slotIndex ---
    chooseSlotAndSetTarget() {
        const chosen = this._chooseWeightedSlot();
        // record immediately (prevents race where same client triggers twice)
        // this._recordSelection(chosen);
        const angle = this.getAngleForSlot(chosen);
        return { slot: chosen + 1, angle };
    }

    // --- Optional: reset history (for debugging) ---
    resetHistory() {
        this._history = Array.from({ length: this.slotCount }, () => []);
        this._saveHistory();
    }
}