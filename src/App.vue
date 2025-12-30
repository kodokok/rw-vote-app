<template>
  <div
    class="min-h-screen bg-linear-to-br from-blue-50 to-slate-100
           flex items-center justify-center px-4"
  >
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

      <!-- HEADER -->
      <div class="text-center mb-4">
        <h1 class="text-2xl font-extrabold text-slate-800">
          {{ title }}
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          {{ subtitle }}
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

      <!-- SKELETON LOADER -->
      <div v-if="isLoading" class="animate-pulse space-y-5">

        <!-- TITLE -->
        <div class="space-y-2 text-center">
          <div class="h-6 bg-slate-200 rounded w-2/3 mx-auto"></div>
          <div class="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
        </div>

        <!-- COUNTDOWN -->
        <div class="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>

        <!-- PIN INPUT -->
        <div class="space-y-2">
          <div class="h-4 bg-slate-200 rounded w-1/4"></div>
          <div class="h-10 bg-slate-200 rounded-xl"></div>
        </div>

        <!-- KANDIDAT -->
        <div class="space-y-4">
          <div class="h-4 bg-slate-200 rounded w-1/3"></div>

          <div
            v-for="i in candidates.length || 2"
            :key="i"
            class="flex items-center gap-4 p-4 rounded-xl border border-slate-200"
          >
            <div class="w-16 h-16 rounded-full bg-slate-200"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-200 rounded w-2/3"></div>
              <div class="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- BUTTON -->
        <div class="h-12 bg-slate-200 rounded-xl"></div>

      </div>

      <!-- VOTING CLOSED -->
      <div v-else-if="!votingOpen" class="text-center py-6">
        <p class="text-xl font-bold text-red-600">
          Voting tidak tersedia
        </p>
        <p class="text-slate-500 mt-2">
          Silakan tunggu waktu voting
        </p>
      </div>

      <!-- VOTING FORM -->
      <div v-else-if="view === 'form'">

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

      <!-- TERIMA KASIH -->
      <div
        v-else-if="view === 'thanks'"
        class="text-center py-8"
      >
        <h2 class="text-2xl font-bold text-green-600 mb-2">
          🎉 Terima Kasih
        </h2>

        <p class="text-slate-600 mb-6">
          Suara Anda telah berhasil dicatat.
          <br />
          Partisipasi Anda sangat berarti.
        </p>

        <button
          @click="backToForm"
          class="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
        >
          Kembali ke Form Voting
        </button>
      </div>

      <!-- FOOTER -->
      <p class="mt-6 text-xs text-center text-slate-400">
        {{ footer }}
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

const title = ref('')
const subtitle = ref('')
const footer = ref('')
const votingOpen = ref(false)
const votingStart = ref(null)
const votingEnd = ref(null)
const now = ref(null)
const countdown = ref('')

let timer = null

const showConfirmModal = ref(false)
const view = ref('form') // form | thanks

const loadingStatus = ref(true)
const loadingCandidates = ref(true)

const isLoading = computed(() =>
  loadingStatus.value || loadingCandidates.value
)

/* ======================
   FETCH CANDIDATES
====================== */
async function fetchCandidates() {
  loadingCandidates.value = true
  try {
    const res = await fetch(`${API_URL}?action=candidates`)
    const json = await res.json()

    if (json.success) {
      candidates.value = json.data
    }
  } catch (e) {
    console.error('Gagal memuat kandidat', e)
  } finally {
    loadingCandidates.value = false
  }
}

/* ======================
   FETCH VOTING STATUS
====================== */
async function fetchVotingStatus() {
  loadingStatus.value = true
  try {
    const res = await fetch(`${API_URL}?action=status`)
    const json = await res.json()

    votingStart.value = json.start ? new Date(json.start) : null
    votingEnd.value = json.end ? new Date(json.end) : null
    now.value = new Date(json.now)

    title.value = json.title
    subtitle.value = json.subtitle
    footer.value = json.app_footer

    updateCountdown()
    startTimer()
  } catch (e) {
    console.error('Gagal memuat status voting', e)
  } finally {
    loadingStatus.value = false
  }
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
      view.value = 'thanks'
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

function backToForm() {
  resetForm()
  message.value = ''
  success.value = false
  view.value = 'form'
}

function onImageError(event) {
  if (!event.target.dataset.fallback) {
    event.target.dataset.fallback = 'true'
    event.target.src = 'https://gravatar.com/avatar/d569400a2428cdaefac57b3c8541eece?s=200&d=mp&r=x'
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
