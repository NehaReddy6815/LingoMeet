export class WebRTCManager {
  constructor() {
    this.peers = new Map();
    this.localStream = null;
  }

  async getLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  createPeerConnection(peerId, socket) {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: peerId,
          candidate: event.candidate
        });
      }
    };

    this.peers.set(peerId, peerConnection);
    return peerConnection;
  }

  async createOffer(peerId, socket) {
    const peerConnection = this.peers.get(peerId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    socket.emit('offer', { to: peerId, offer });
  }

  async handleOffer(peerId, offer, socket) {
    const peerConnection = this.createPeerConnection(peerId, socket);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.emit('answer', { to: peerId, answer });
  }

  async handleAnswer(peerId, answer) {
    const peerConnection = this.peers.get(peerId);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(peerId, candidate) {
    const peerConnection = this.peers.get(peerId);
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  closePeerConnection(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(peerId);
    }
  }

  closeAllConnections() {
    this.peers.forEach((pc, peerId) => {
      pc.close();
    });
    this.peers.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }
}