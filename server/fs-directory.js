'use strict'

export default function getFSDirectory(vcapServices = process.env.VCAP_SERVICES) {
    const services = JSON.parse(vcapServices || {})
    const dir = services['fs-storage'].find(f => f.name === 'gorilla-fs').volume_mounts[0].container_dir
    return dir
}