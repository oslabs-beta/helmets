/*

helm template helm-chart-sample -s ./backend/templates/configmap-appsettings.yaml -f helm-chart-sample/values.yaml --debug


helm template helm-chart-sample --execute backend/templates/configmap-appsettings.yaml -f helm-chart-sample/values.yaml --debug


helm template -s backend/templates/configmap-appsettings.yaml .

*/