// Admin Warning Helper - Creates admin warning messages instead of notifications
import { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export async function sendAdminWarning(
  supabaseAdmin: SupabaseClient,
  contentOwnerId: string,
  message: string,
  metadata: any
) {
  try {
    console.log('🚨 Starting sendAdminWarning for user:', contentOwnerId);
    console.log('📧 Warning message:', message);
    console.log('📊 Metadata:', JSON.stringify(metadata, null, 2));
    
    // Create or get admin warning conversation
    const { data: existingConv, error: queryError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('buyer_id', contentOwnerId)
      .eq('seller_id', contentOwnerId)
      .eq('is_admin_warning', true)
      .maybeSingle();
    
    if (queryError) {
      console.error('Error querying existing conversation:', queryError);
    }
    
    console.log('Existing admin conversation:', existingConv);

    let conversationId = existingConv?.id;

    // If no conversation exists, create one
    if (!conversationId) {
      console.log('Creating new admin warning conversation...');
      
      const { data: newConv, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({
          buyer_id: contentOwnerId,
          seller_id: contentOwnerId,
          listing_id: null,
          is_admin_warning: true,
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (convError) {
        console.error('Error creating admin warning conversation:', convError);
        return { success: false, error: convError };
      }
      
      console.log('Created conversation:', newConv);
      conversationId = newConv?.id;
    } else {
      console.log('Using existing conversation:', conversationId);
    }

    // Create the warning message
    if (conversationId) {
      console.log('Creating admin warning message in conversation:', conversationId);
      
      const { error: msgError } = await supabaseAdmin
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: contentOwnerId,  // Use content owner as sender for admin messages
          content: message,
          is_read: false,
          is_admin_warning: true,
          metadata,
          created_at: new Date().toISOString()
        });

      if (msgError) {
        console.error('Error creating admin warning message:', msgError);
        return { success: false, error: msgError };
      }
      
      console.log('✅ Admin warning message created successfully');

      // Update conversation last message
      await supabaseAdmin
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_content: message
        })
        .eq('id', conversationId);
      
      console.log('✅ Conversation updated with last message');

      return { success: true, conversationId };
    }

    return { success: false, error: 'Failed to create conversation' };
  } catch (error) {
    console.error('Error in sendAdminWarning:', error);
    return { success: false, error };
  }
}