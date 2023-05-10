const testobj = 
{
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: '{{ include "backend.fullname" . }}',
    labels: '{{- include "backend.labels" . | nindent 4 }}'
  },
  spec: {
    '{{- if not .Values.autoscaling.enabled }}': 'EXP',
    replicas: '{{ .Values.replicaCount }}',
    '{{- end }}': 'EXP',
    selector: {
      matchLabels: '{{- include "backend.selectorLabels" . | nindent 6 }}'
    },
    template: {
      metadata: {
        '{{- with .Values.podAnnotations }}': 'EXP',
        annotations: '{{- toYaml . | nindent 8 }}',
        '{{- end }}': 'EXP',
        labels: '{{- include "backend.selectorLabels" . | nindent 8 }}'
      },
      spec: {
        '{{- with .Values.imagePullSecrets }}': 'EXP',
        imagePullSecrets: '{{- toYaml . | nindent 8 }}',
        '{{- end }}': 'EXP',
        serviceAccountName: '{{ include "backend.serviceAccountName" . }}',
        securityContext: '{{- toYaml .Values.podSecurityContext | nindent 8 }}',
        containers: [
          { 
            name: '{{ .Chart.Name }}',
            securityContext: '{{- toYaml .Values.securityContext | nindent 12 }}',
            image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}",
            imagePullPolicy: '{{ .Values.image.pullPolicy }}',
            ports: [
              {
                name: 'http',
                containerPort: '5000',
                protocol: 'TCP'
              },
              {
                name: 'https',
                containerPort: '5001',
                protocol: 'TCP'
              }
            ],
            envFrom: [
              {
                configMapRef: {
                  name: '{{ include "backend.configmapname.env" . }}'
                }
              }
            ],
            volumeMounts: [
              {
                name: 'config-volume',
                mountPath: '/app/appsettings.Kubernetes.json',
                subPath: 'appsettings.Kubernetes.json'
              }
            ],
            livenessProbe: {
              httpGet: {
                path: '/',
                port: 'http'
              }
            },
            readinessProbe: {
              httpGet: {
                path: '/',
                port: 'http',
              }
            },
            resources: '{{- toYaml .Values.resources | nindent 12 }}'
          }
        ],
        volumes: [
          {
            name: 'config-volume',
            configMap: {
              name: '{{ include "backend.configmapname.appsettings" . }}'
            }
          }
        ],
        '{{- with .Values.nodeSelector }}': 'EXP',
        nodeSelector: '{{- toYaml . | nindent 8 }}',
        '{{- end }}': 'EXP',
        '{{- with .Values.affinity }}': 'EXP',
        affinity: '{{- toYaml . | nindent 8 }}',
        '{{- end }}': 'EXP',
        '{{- with .Values.tolerations }}': 'EXP',
        tolerations: '{{- toYaml . | nindent 8 }}',
        '{{- end }}': 'EXP'
      }
    }
  }
}