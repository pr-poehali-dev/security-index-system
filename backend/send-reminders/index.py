'''
Business: Отправка email-напоминаний о приближающихся сроках инцидентов
Args: event - dict с httpMethod, body (JSON с email, incidents)
      context - object с request_id, function_name
Returns: HTTP response dict с результатом отправки
'''

import json
import os
from datetime import datetime
from typing import Dict, Any, List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    recipient_email: str = body_data.get('email', '')
    incidents: List[Dict[str, Any]] = body_data.get('incidents', [])
    
    if not recipient_email or not incidents:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email and incidents are required'})
        }
    
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    
    if not smtp_user or not smtp_password:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'SMTP credentials not configured'})
        }
    
    try:
        html_content = generate_email_html(incidents)
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Напоминание: {len(incidents)} инцидентов требуют внимания'
        msg['From'] = smtp_user
        msg['To'] = recipient_email
        
        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': f'Email sent to {recipient_email}',
                'incidents_count': len(incidents)
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Failed to send email: {str(e)}'})
        }


def generate_email_html(incidents: List[Dict[str, Any]]) -> str:
    critical = [inc for inc in incidents if inc.get('daysLeft', 999) <= 3]
    warning = [inc for inc in incidents if 3 < inc.get('daysLeft', 999) <= 7]
    
    html = f'''
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f97316; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background-color: #f9fafb; padding: 20px; }}
            .incident {{ background-color: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }}
            .incident.critical {{ border-left-color: #ef4444; }}
            .incident.warning {{ border-left-color: #f97316; }}
            .badge {{ display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }}
            .badge.critical {{ background-color: #fee2e2; color: #dc2626; }}
            .badge.warning {{ background-color: #fed7aa; color: #ea580c; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin: 0;">⏰ Напоминание о сроках инцидентов</h2>
                <p style="margin: 10px 0 0 0;">У вас {len(incidents)} инцидентов требуют внимания</p>
            </div>
            <div class="content">
    '''
    
    if critical:
        html += f'''
                <h3 style="color: #dc2626;">🚨 Критично (≤3 дней)</h3>
        '''
        for inc in critical:
            html += f'''
                <div class="incident critical">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <strong>{inc.get('description', 'Без описания')}</strong>
                            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                                {inc.get('organization', '—')} • {inc.get('direction', '—')}
                            </p>
                        </div>
                        <span class="badge critical">{inc.get('daysLeft', 0)} дней</span>
                    </div>
                </div>
            '''
    
    if warning:
        html += f'''
                <h3 style="color: #ea580c; margin-top: 20px;">⚠️ Скоро истекает (4-7 дней)</h3>
        '''
        for inc in warning:
            html += f'''
                <div class="incident warning">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <strong>{inc.get('description', 'Без описания')}</strong>
                            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                                {inc.get('organization', '—')} • {inc.get('direction', '—')}
                            </p>
                        </div>
                        <span class="badge warning">{inc.get('daysLeft', 0)} дней</span>
                    </div>
                </div>
            '''
    
    html += '''
            </div>
            <div class="footer">
                <p>Это автоматическое уведомление из системы учета инцидентов</p>
                <p>Не отвечайте на это письмо</p>
            </div>
        </div>
    </body>
    </html>
    '''
    
    return html
