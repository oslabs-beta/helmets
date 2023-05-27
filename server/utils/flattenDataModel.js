const input = {
  filePath: "sample/web/deployment.yaml",
  fileContents: {
    a: {
      b: {
        c: 'hello',
        d: 'world',
      },
      e: 'foo',
    },
    f: 'bar',
  }
};

const deploymentDataModel = {
  fileName: "deployment.yaml",
  filePath: "sample/web/deployment.yaml",
  type: "tamplate",
  source: "this will be a reference to another obj, eventually",
  values: "this will reference a values file obj, eventually",
  fileContents: {
    "{{- $fullName := include \"backend.fullname\" . -}}": "EXP",
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
      "name": "{{ include \"backend.fullname\" . }}",
      "labels": {
        "{{- include \"backend.labels\" . | nindent 4 }}": "EXP"
      }
    },
    "spec": {
      "{{- if not .Values.autoscaling.enabled }}": "EXP",
      "replicas": "{{ .Values.replicaCount }}",
      "{{- end }}": "EXP",
      "selector": {
        "matchLabels": {
          "{{- include \"backend.selectorLabels\" . | nindent 6 }}": "EXP"
        }
      },
      "template": {
        "metadata": {
          "{{- with .Values.podAnnotations }}": "EXP",
          "annotations": {
            "{{- toYaml . | nindent 8 }}": "EXP"
          },
          "{{- end }}": "EXP",
          "labels": {
            "{{- include \"backend.selectorLabels\" . | nindent 8 }}": "EXP"
          }
        },
        "spec": {
          "{{- with .Values.imagePullSecrets }}": "EXP",
          "imagePullSecrets": {
            "{{- toYaml . | nindent 8 }}": "EXP"
          },
          "{{- end }}": "EXP",
          "serviceAccountName": "{{ include \"backend.serviceAccountName\" . }}",
          "securityContext": {
            "{{- toYaml .Values.podSecurityContext | nindent 8 }}": "EXP"
          },
          "containers": [
            {
              "- name": "{{ .Chart.Name }}",
              "securityContext": {
                "{{- toYaml .Values.securityContext | nindent 12 }}": "EXP"
              },
              "image": "\"{{ .Values.image.repository }}",
              "imagePullPolicy": "{{ .Values.image.pullPolicy }}",
              "ports": [
                {
                  "- name": "http",
                  "containerPort": "5000",
                  "protocol": "TCP"
                },
                {
                  "- name": "https",
                  "containerPort": "5001",
                  "protocol": "TCP"
                }
              ],
              "envFrom": [
                {
                  "- configMapRef": {
                    "name": "{{ include \"backend.configmapname.env\" . }}"
                  }
                }
              ],
              "volumeMounts": [
                {
                  "- name": "config-volume",
                  "mountPath": "/app/appsettings.Kubernetes.json",
                  "subPath": "appsettings.Kubernetes.json"
                }
              ],
              "livenessProbe": {
                "httpGet": {
                  "path": "/",
                  "port": "http"
                }
              },
              "readinessProbe": {
                "httpGet": {
                  "path": "/",
                  "port": "http"
                }
              },
              "resources": {
                "{{- toYaml .Values.resources | nindent 12 }}": "EXP"
              }
            }
          ],
          "volumes": [
            {
              "- name": "config-volume",
              "configMap": {
                "name": "{{ include \"backend.configmapname.appsettings\" . }}"
              }
            }
          ],
          "{{- with .Values.nodeSelector }}": "EXP",
          "nodeSelector": {
            "{{- toYaml . | nindent 8 }}": "EXP"
          },
          "{{- with .Values.affinity }}": "EXP",
          "affinity": {
            "{{- toYaml . | nindent 8 }}": "EXP"
          },
          "{{- with .Values.tolerations }}": "EXP",
          "tolerations": {
            "{{- toYaml . | nindent 8 }}": "EXP"
          }
        }
      }
    }
  }
}

const flattenObject = (path, obj) => {
  const output = [];
  let lineNumber = 1;

  const addLineObject = (lineNumber, indent, value) => {
    output.push({ nodeID:`${path}__${lineNumber}`, indent: indent, value: value });
  }

  const addCompositeMarker = (type, indent) => {
    output.push({nodeID: `marker`, indent, value: type});
  }

  const flattenHelper = (current, indent = 0) => {
    if (Array.isArray(current)) {
      addCompositeMarker('[', indent);
      current.forEach((el,i) => {
        if (Array.isArray(el)) {
          // addLineObject(lineNumber, indent, i);
          // lineNumber += 1;
          flattenHelper(el, indent+1);
        } else if (typeof el === 'object' && el !== null) {
          // addLineObject(lineNumber, indent, i);
          // lineNumber += 1;
          flattenHelper(el, indent+1);
        } else {
          addLineObject(lineNumber, indent, el);
          lineNumber += 1;
        }
      });
      addCompositeMarker(']', indent);
    } else if (typeof current === 'object' && current !== null) {
      addCompositeMarker('{', indent);
      for (const key in current) {
        if (Array.isArray(current[key])){
          addLineObject(lineNumber, indent, key);
          lineNumber += 1;
          flattenHelper(current[key], indent+1);
        } else if (typeof current[key] === 'object' && current[key] !== null) {
          addLineObject(lineNumber, indent, key);
          lineNumber += 1;
          flattenHelper(current[key], indent+1);
        } else {
          addLineObject(lineNumber, indent, {[key]:current[key]});
          lineNumber += 1;
        }
      }
      addCompositeMarker('}', indent);
    } 
  }

  flattenHelper(obj);
  return output;
}

// const output = flattenObject(deploymentDataModel.filePath, deploymentDataModel.fileContents);
// console.log(output);

module.exports = flattenObject;