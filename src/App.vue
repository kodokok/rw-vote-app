<template>
  <div
    class="min-h-screen bg-linear-to-br from-blue-50 to-slate-100
           flex items-center justify-center px-4"
  >
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

      <!-- HEADER -->
      <div class="text-center mb-4">
        <h1 class="text-2xl font-extrabold text-slate-800">
          Pemilihan Ketua RW
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          RW 05 • Periode 2025 – 2030
        </p>
      </div>

      <!-- COUNTDOWN -->
      <div class="mb-4 text-center">
        <p
          class="font-semibold"
          :class="votingOpen ? 'text-green-600' : 'text-red-600'"
        >
          {{ countdown }}
        </p>
      </div>

      <!-- VOTING CLOSED -->
      <div v-if="!votingOpen" class="text-center py-6">
        <p class="text-xl font-bold text-red-600">
          Voting tidak tersedia
        </p>
        <p class="text-slate-500 mt-2">
          Silakan tunggu waktu voting
        </p>
      </div>

      <!-- VOTING FORM -->
      <div v-else>

        <!-- PIN -->
        <div class="mb-5">
          <label class="block text-sm font-semibold text-slate-700 mb-1">
            PIN Pemilih
          </label>
          <input
            v-model="pin"
            type="text"
            placeholder="Masukkan PIN Anda"
            class="w-full rounded-xl border border-slate-300 px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-slate-500 mt-1">
            PIN hanya dapat digunakan satu kali
          </p>
        </div>

        <!-- KANDIDAT -->
        <div v-if="loadingCandidates" class="text-center text-slate-500">
          Memuat data kandidat...
        </div>

        <div v-else class="space-y-3">
          <p class="text-sm font-semibold text-slate-700">
            Pilih Calon Ketua RW
          </p>

          <label
            v-for="c in candidates"
            :key="c.id"
            class="flex items-center gap-4 p-4 rounded-xl border
                   cursor-pointer transition"
            :class="selected === c.id
              ? 'border-blue-600 bg-blue-50 shadow'
              : 'border-slate-200 hover:border-blue-300'"
          >
            <input
              type="radio"
              class="hidden"
              :value="c.id"
              v-model="selected"
            />

            <div
              v-if="!c.photo"
              class="w-24 h-24 rounded-full bg-slate-200
                    flex items-center justify-center
                    text-2xl font-bold text-slate-600 mx-auto"
            >
              {{ c.nama.charAt(0) }}
            </div>

            <img
              v-else
              :src="c.photo"
              @error="onImageError"
              class="w-24 h-24 rounded-full object-cover mx-auto"
            />

            <div class="flex-1">
              <p class="font-bold text-slate-800">
                {{ c.nama }}
              </p>
              <p class="text-sm text-slate-500">
                {{ c.desc }}
              </p>
            </div>
          </label>
        </div>

        <!-- SUBMIT -->
        <button
          @click="openConfirm"
          :disabled="loading"
          class="w-full mt-6 py-3 rounded-xl text-white font-bold text-lg
                bg-blue-600 hover:bg-blue-700
                disabled:opacity-50 disabled:cursor-not-allowed"
        >
          KIRIM SUARA
        </button>


        <!-- MESSAGE -->
        <div v-if="message" class="mt-4 text-center">
          <p
            class="font-semibold"
            :class="success ? 'text-green-600' : 'text-red-600'"
          >
            {{ message }}
          </p>
        </div>

      </div>

      <!-- FOOTER -->
      <p class="mt-6 text-xs text-center text-slate-400">
        ⚠️ Setiap warga hanya dapat memilih satu kali
      </p>

    </div>
  </div>
  <!-- MODAL KONFIRMASI -->
  <div
    v-if="showConfirmModal"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-xl p-6 w-full max-w-sm">
      <h2 class="text-lg font-bold text-slate-800 mb-2">
        Konfirmasi Pilihan
      </h2>

      <p class="text-slate-600 mb-4">
        Apakah Anda yakin dengan pilihan ini?
        <br />
        <span class="font-semibold">
          {{
            candidates.find(c => c.id === selected)?.nama
          }}
        </span>
      </p>

      <div class="flex gap-3">
        <button
          @click="showConfirmModal = false"
          class="flex-1 py-2 rounded-lg border font-semibold"
        >
          Batal
        </button>

        <button
          @click="confirmVote"
          class="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold"
        >
          Ya, Kirim
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

/* ======================
   CONFIG
====================== */
import { API_URL } from './utils/api'

/* ======================
   STATE
====================== */
const pin = ref('')
const selected = ref(null)
const loading = ref(false)
const message = ref('')
const success = ref(false)

const candidates = ref([])
const loadingCandidates = ref(true)

const votingOpen = ref(false)
const votingStart = ref(null)
const votingEnd = ref(null)
const now = ref(null)
const countdown = ref('')

let timer = null

const showConfirmModal = ref(false)

/* ======================
   FETCH CANDIDATES
====================== */
async function fetchCandidates() {
  try {
    const res = await fetch(`${API_URL}?action=candidates`)
    const json = await res.json()
    if (json.success) {
      candidates.value = json.data
    }
  } finally {
    loadingCandidates.value = false
  }
}

/* ======================
   FETCH VOTING STATUS
====================== */
async function fetchVotingStatus() {
  const res = await fetch(`${API_URL}?action=status`)
  const json = await res.json()

  votingStart.value = new Date(json.start)
  votingEnd.value = new Date(json.end)
  now.value = new Date(json.now)

  updateCountdown()
  startTimer()
}

/* ======================
   COUNTDOWN
====================== */
function startTimer() {
  timer = setInterval(() => {
    now.value = new Date(now.value.getTime() + 1000)
    updateCountdown()
  }, 1000)
}

function updateCountdown() {
  if (now.value < votingStart.value) {
    votingOpen.value = false
    countdown.value = formatDiff(votingStart.value - now.value, 'Voting dibuka dalam')
  } else if (now.value > votingEnd.value) {
    votingOpen.value = false
    countdown.value = 'Voting telah ditutup'
    clearInterval(timer)
  } else {
    votingOpen.value = true
    countdown.value = formatDiff(votingEnd.value - now.value, 'Sisa waktu voting')
  }
}

function formatDiff(ms, label) {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${label}: ${pad(h)}:${pad(m)}:${pad(s)}`
}

function pad(n) {
  return String(n).padStart(2, '0')
}

/* ======================
   SUBMIT VOTE
====================== */
async function confirmVote() {
  showConfirmModal.value = false
  loading.value = true
  message.value = ''

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        pin: pin.value.trim(),
        candidate_id: selected.value
      })
    })

    const data = await res.json()
    success.value = data.success
    message.value = data.message

    // ❌ PIN SUDAH DIGUNAKAN → RESET FORM
    if (!data.success && data.message.includes('PIN sudah digunakan')) {
      resetForm()
    }

    // ✅ SUKSES → OPTIONAL LOCK UI
    if (data.success) {
      // bisa tambahkan disable form jika mau
    }

  } catch {
    success.value = false
    message.value = 'Gagal mengirim suara'
  } finally {
    loading.value = false
  }
}

function openConfirm() {
  if (!pin.value) {
    message.value = 'PIN wajib diisi'
    success.value = false
    return
  }

  if (!selected.value) {
    message.value = 'Silakan pilih calon Ketua RW'
    success.value = false
    return
  }

  showConfirmModal.value = true
}

function resetForm() {
  pin.value = ''
  selected.value = null

  // fokus kembali ke PIN
  setTimeout(() => {
    const el = document.querySelector('input[type="text"]')
    if (el) el.focus()
  }, 100)
}

function onImageError(event) {
  if (!event.target.dataset.fallback) {
    event.target.dataset.fallback = 'true'
    event.target.src = '/avatar-default.png'
  }
}

/* ======================
   LIFECYCLE
====================== */
onMounted(() => {
  fetchCandidates()
  fetchVotingStatus()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
