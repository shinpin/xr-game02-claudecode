import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvas = document.getElementById('game-canvas')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1208)
scene.fog = new THREE.Fog(0x1a1208, 20, 60)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 8, 12)
camera.lookAt(0, 0, 0)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05

const ambient = new THREE.AmbientLight(0xffd9a0, 0.6)
scene.add(ambient)
const sun = new THREE.DirectionalLight(0xfff4e0, 1.2)
sun.position.set(5, 10, 5)
scene.add(sun)

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) })

const floorGeo = new THREE.BoxGeometry(10, 0.5, 10)
const floorMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 })
const floorMesh = new THREE.Mesh(floorGeo, floorMat)
floorMesh.position.y = -0.25
scene.add(floorMesh)

const floorBody = new CANNON.Body({ mass: 0 })
floorBody.addShape(new CANNON.Box(new CANNON.Vec3(5, 0.25, 5)))
world.addBody(floorBody)

const ballGeo = new THREE.SphereGeometry(0.4, 16, 16)
const ballMat = new THREE.MeshLambertMaterial({ color: 0xcc4400 })
const ballMesh = new THREE.Mesh(ballGeo, ballMat)
scene.add(ballMesh)

const ballBody = new CANNON.Body({ mass: 1 })
ballBody.addShape(new CANNON.Sphere(0.4))
ballBody.position.set(0, 3, 0)
world.addBody(ballBody)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})



// ─── 鍵盤控制 ───
const keys = {}
window.addEventListener('keydown', e => keys[e.code] = true)
window.addEventListener('keyup', e => keys[e.code] = false)

function applyBallControl() {
  const force = 6
  if (keys['KeyW'] || keys['ArrowUp'])    ballBody.applyForce(new CANNON.Vec3(0, 0, -force), ballBody.position)
  if (keys['KeyS'] || keys['ArrowDown'])  ballBody.applyForce(new CANNON.Vec3(0, 0,  force), ballBody.position)
  if (keys['KeyA'] || keys['ArrowLeft'])  ballBody.applyForce(new CANNON.Vec3(-force, 0, 0), ballBody.position)
  if (keys['KeyD'] || keys['ArrowRight']) ballBody.applyForce(new CANNON.Vec3( force, 0, 0), ballBody.position)
}

function animate() {
  requestAnimationFrame(animate)
  applyBallControl()
  world.fixedStep()
  ballMesh.position.copy(ballBody.position)
  ballMesh.quaternion.copy(ballBody.quaternion)
  controls.update()
  renderer.render(scene, camera)
}

animate()
