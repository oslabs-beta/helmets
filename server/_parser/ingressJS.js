const yamlObj = {
  "{{- if .Values.ingress.enabled -}}": "EXP",
  "{{- $fullName := include \"backend.fullname\" . -}}": "EXP",
  "{{- $svcPort := .Values.service.httpPort -}}": "EXP",
  "{{- if and .Values.ingress.className (not (semverCompare \">=1.18-0\" .Capabilities.KubeVersion.GitVersion)) }}": "EXP",
  "{{- if not (hasKey .Values.ingress.annotations \"kubernetes.io/ingress.class\") }}": "EXP",
  "{{- $_ := set .Values.ingress.annotations \"kubernetes.io/ingress.class\" .Values.ingress.className}}": "EXP",
  "{{- end }}": "EXP",
  "{{- if semverCompare \">=1.19-0\" .Capabilities.KubeVersion.GitVersion -}}": "EXP",
  "apiVersion": "extensions/v1beta1",
  "{{- else if semverCompare \">=1.14-0\" .Capabilities.KubeVersion.GitVersion -}}": "EXP",
  "{{- else -}}": "EXP",
  "kind": "Ingress",
  "metadata": {
    "name": "{{ $fullName }}",
    "labels": {
      "{{- include \"backend.labels\" . | nindent 4 }}": "EXP"
    },
    "{{- with .Values.ingress.annotations }}": "EXP",
    "annotations": {
      "{{- toYaml . | nindent 4 }}": "EXP"
    },
    "{{- end }}": "EXP"
  },
  "spec": {
    "{{- if and .Values.ingress.className (semverCompare \">=1.18-0\" .Capabilities.KubeVersion.GitVersion) }}": "EXP",
    "ingressClassName": "{{ .Values.ingress.className }}",
    "{{- end }}": "EXP",
    "{{- if .Values.ingress.tls }}": "EXP",
    "tls": [
      {
        "{{- range .Values.ingress.tls }}": "EXP"
      },
      {
        "- hosts": {
          "{{- range .hosts }}": "EXP",
          "- {{ . | quote }}": {
            "{{- end }}": "EXP"
          },
          "secretName": "{{ .secretName }}"
        }
      }
    ],
    "rules": [
      {
        "{{- range .Values.ingress.hosts }}": "EXP"
      },
      {
        "- host": "{{ .host | quote }}",
        "http": {
          "paths": [
            {
              "{{- range .paths }}": "EXP"
            },
            {
              "- path": "{{ .path }}",
              "{{- if and .pathType (semverCompare \">=1.18-0\" $.Capabilities.KubeVersion.GitVersion) }}": "EXP",
              "pathType": "{{ .pathType }}",
              "{{- end }}": "EXP",
              "backend": {
                "{{- if semverCompare \">=1.19-0\" $.Capabilities.KubeVersion.GitVersion }}": "EXP",
                "service": {
                  "name": "{{ $fullName }}",
                  "port": {
                    "number": "{{ $svcPort }}"
                  }
                },
                "{{- else }}": "EXP",
                "serviceName": "{{ $fullName }}",
                "servicePort": "{{ $svcPort }}",
                "{{- end }}": "EXP"
              }
            }
          ],
          "{{- end }}": "EXP"
        }
      }
    ]
  }
}