const values = {
  installToggle: {
    backend: true,
    web: true
  },
  global: {  
    hosts: {    
      backend: "demo-k8s-backend.com",
      web: "demo-k8s-web.com"
    }
  },
  backend:{
    fullnameOverride: "demo-k8s-backend",
    replicaCount: 1,
    image: {
      repository: "karatejb/demo-k8s",
      pullPolicy: "IfNotPresent",
      tag: "latest"
    },
    service: {
      type: "ClusterIP",
      httpPort: 5000,
      httpsPort: 5001 
    },
    imagePullSecrets: [],
    nameOverride: "",
    podAnnotations: {},
    podSecurityContext: {},
    ingress: {
      enabled: true,
      annotations: {},
      hosts: [
        {
          host: "demo-k8s-backend.com",
          paths: [
            {
              path: "/",
              pathType: "Prefix"
            }
          ]
        }
      ] 
    },
    resources: {},
    autoscaling: {
      enabled: false
    },
    serviceAccount: {
      create: false
    },
    env: {
      "ASPNETCORE_ENVIRONMENT": "Kubernetes",
      "ASPNETCORE_FORWARDEDHEADERS_ENABLED": "true"
    },
    appConfig: {
      theme: "#FFFFE0"
    }
  },
  web: {
    fullnameOverride: "demo-k8s-web",
    replicaCount: 1,
    image: {
      repository: "karatejb/demo-k8s-web",
      pullPolicy: "IfNotPresent",
      tag: "latest"
    },
    service: {
      type: "ClusterIP",
      httpPort: 80,
      httpsPort: 443 
    },
    imagePullSecrets: [],
    nameOverride: "",
    podAnnotations: {},
    podSecurityContext: {},
    ingress: {
      enabled: true,
      annotations: {},
      hosts: [
        { 
          host: "demo-k8s-web.com",
          paths: [
            {
              path: "/",
              pathType: "Prefix"
            }
          ]
        }
      ]
    },
    resources: {},
    autoscaling: {
      enabled: false
    },
    serviceAccount: {
      create: false
    }
  }
}

module.exports = values;