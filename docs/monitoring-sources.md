# مصادر مراقبة الأداء والاختبار

هذه الملاحظات تحفظ المصادر الرسمية التي استُخدمت عند توصية أدوات مراقبة رَكيزة.

- Prometheus: نظام مفتوح المصدر لمراقبة الأنظمة والتنبيه، يجمع المقاييس كسلاسل زمنية ويستخدم نموذج سحب HTTP وPromQL. المصدر: https://prometheus.io/docs/introduction/overview/
- Grafana + Prometheus: Grafana Open Source يوفر لوحات واستعلامات وعرضاً لمقاييس Prometheus؛ توثيق البدء يوضح استخدام Node Exporter وPrometheus ولوحات Grafana. المصدر: https://grafana.com/docs/grafana/latest/fundamentals/getting-started/first-dashboards/get-started-grafana-prometheus/
- Netdata: وكيل مراقبة مفتوح المصدر للعرض اللحظي، مع مقاييس دقيقة وتكاملات جاهزة؛ خدمات Netdata السحابية التجارية منفصلة عن الوكيل المفتوح المصدر. المصدر: https://www.netdata.cloud/open-source/
- Percona Monitoring and Management: منصة مفتوحة المصدر لمراقبة قواعد البيانات، تتضمن Query Analytics ولوحات لمؤشرات MySQL وقواعد بيانات أخرى، وتحتاج تثبيتاً منفصلاً أو Docker/VM حسب طريقة النشر. المصدر: https://docs.percona.com/percona-monitoring-and-management/3/index.html
- Grafana k6: أداة اختبار ضغط HTTP/API، وتستخدم السيناريوهات وعتبات النجاح لقياس p95/p99 ومعدل الأخطاء. المصدر: https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/

ملاحظة تشغيلية: رَكيزة تعمل على استضافة WebDev مُدارة بنمط Autoscale، لذلك لا يُفترض وجود صلاحية تثبيت exporters داخل خادم التطبيق. الأفضل تشغيل أدوات المراقبة على جهاز أو خادم مراقبة منفصل، واستخدام المقاييس والسجلات التي تسمح بها الاستضافة. هذه المصادر لا تثبت سعة رَكيزة؛ السعة يجب قياسها باختبار حمل مطابق لإعداد الإنتاج.
